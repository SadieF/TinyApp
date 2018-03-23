let express = require("express"); //Requires Express
let app = express(); //calls the Express function
let PORT = process.env.PORT || 8080; // Sets default port at 8080
let cookieParser = require('cookie-parser') //Requires cookieParser

app.set("view engine", "ejs"); //Sets view engine to EJS

app.use(cookieParser()); //uses cookieParser

let bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
    extended: true
})); //Returns middleware that only parses urlencoded bodies and only looks at requests where the Content-Type header matches the type option.


let urlDatabase = {
userID: {
  shortURL: "b2xVn2",
  longURL: "http://www.lighthouselabs.ca",
  uid: "asdfg"
},
userID2: {
  shortURL: "ue65ng",
  longURL: "http://www.google.ca",
  uid: "asdasdfgh"
}
}
// /Sets URLDatabase when URLs, and their random number strings

// console.log(urlDatabas)


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

// for (key in users) {
//   users[req.cookies.user_id]
// }


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

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
    res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
    let user_id = req.cookies.user_id;
    let user = users[user_id];
    let templateVars = {
        urls: urlDatabase,
        user_id: user_id,
        user: user
    };
    res.render("urls_index", templateVars);
});


app.get("/login", (req, res) => {
    let user_id = req.cookies.user_id;
    let user = users[user_id];
    let templateVars = {
        shortURL: req.params.id,
        longURL: urlDatabase[req.params.id],
        email: req.body.email,
        password: req.body.password,
        user_id: user_id,
        user: user
    };
    res.render("login", templateVars);
});

app.get("/register", (req, res) => {
    let user_id = req.cookies.user_id;
    let user = users[user_id];
    let templateVars = {
        shortURL: req.params.id,
        longURL: urlDatabase[req.params.id],
        email: req.body.email,
        password: req.body.password,
        user_id: user_id,
        user: user
    };
    res.render("register", templateVars);
});


app.post("/register", (req, res) => {
    let userId = generateRandomString();
    res.cookie("user_id", userId);

    for (let key in users) {
        const user = users[key];
        if (user.email === req.body.email) {
            return res.redirect(400, "/register");
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
        res.redirect(400, "/register");
    }
});

app.get("/urls/new", (req, res) => {
    let user_id = req.cookies.user_id;
    let user = users[user_id];
    let templateVars = {
        shortURL: req.params.id,
        longURL: urlDatabase[req.params.id],
        email: req.body.email,
        password: req.body.password,
        user_id: user_id,
        user: user
    };
    if (req.cookies.user_id) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect(400, "/login");
  }
});

console.log(urlDatabase);

app.get("/urls/:id", (req, res) => {
    let user_id = req.cookies.user_id;
    let user = users[user_id];
    let templateVars = {
        shortURL: req.params.id,
        longURL: urlDatabase[req.params.id],
        email: req.body.email,
        password: req.body.password,
        user_id: user_id,
        user: user
    };
    res.render("urls_shows", templateVars);
});

app.post("/urls/:id/delete", (req, res) => {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
});

app.post("/urls", (req, res) => {
let shortURL = generateRandomString();
urlDatabase[req.cookies.user_id]= {
        shortURL: shortURL,
        longURL: req.body.longURL,
        uid: req.cookies.user_id
}
    console.log(urlDatabase);
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
    for (let currentUser in users) {
        if ((req.body.email === users[currentUser].email) && (req.body.password === users[currentUser].password)) {
            res.cookie("user_id", users[currentUser].id);
            return res.redirect("/");
        }
    }
    return res.redirect(403, "/login")

});

app.post("/logout", (req, res) => {
    for (let currentUser in users) {
        res.clearCookie("user_id", users[currentUser].id);
        res.redirect("/urls");
    }
});

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);

  });




