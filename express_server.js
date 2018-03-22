let express = require("express");
let app = express();
let PORT = process.env.PORT || 8080; // default port 8080
let cookieParser = require('cookie-parser')

app.set("view engine", "ejs");

app.use(cookieParser());

let bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

function generateRandomString() {
  let text = "";
  let random = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";

  for (var i = 0; i < 6; i++)
      text += random.charAt(Math.floor(Math.random() * random.length));

  return text;
};

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"],
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/register", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.cookies["username"],
    email: req.body.email,
    password: req.body.password,
  };
  res.render("urls_register", templateVars);
});

app.post("/urls/register", (req, res) => {
  let userId = generateRandomString();
  res.cookie("user_id", userId);

for (let key in users) {
  const user = users[key];
 if  (user.email === req.body.email) {
  return res.redirect(400, "/urls/register");
  }
};

if (req.body.email && req.body.password) {
    users[userId] = {
    id: userId,
    email: req.body.email,
    password: req.body.password
  };
    res.redirect("/urls");
} else {
  res.redirect(400, "/urls/register");
}
  // console.log(users);

});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
    let templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
    };
    res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.cookies["username"],
  };
  res.render("urls_shows", templateVars);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`)
});

app.post("/urls/:id/update", (req, res) => {
urlDatabase[req.params.id] = req.body.longURL;
res.redirect(`/urls/${req.params.id}`);
})

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/login", (req, res) => {

  res.cookie("username", req.body.username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username", req.body.username);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


