const express = require("express"); //Requires Express
const app = express(); //calls the Express function
const PORT = process.env.PORT || 8080; // Sets default port at 8080
const cookieParser = require('cookie-parser'); //Requires cookieParser
const bcrypt = require('bcrypt');


//Sets view engine to EJS
app.set("view engine", "ejs");
//uses cookieParser
app.use(cookieParser());
//Returns middleware that only parses urlencoded bodies and only looks at requests where the Content-Type header matches the type option.
let bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
    extended: true
}));



// /Sets URLDatabase when URLs, and their random number strings
let urlDatabase = {
    b2xVn2: {
      shortURL: "b2xVn2",
      longURL: "http://www.lighthouselabs.ca",
      uid: "userRandomID"
    },
    ue65ng: {
      shortURL: "ue65ng",
      longURL: "http://www.google.ca",
      uid: "userRandomID"
    },
    uuuuuu: {
      shortURL: "uuuuuu",
      longURL: "http://www.google.ca/such_a_user2_thing",
      uid: "user2RandomID"
    }
}

//Sets the users database with the
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

function urlsForUser(user_id) {
    let newDB = {}
    for (let shortURL in urlDatabase) {
        if (user_id === urlDatabase[shortURL].uid) {
            newDB[shortURL] = urlDatabase[shortURL].longURL;
        }
    }
 return newDB;
}

// console.log(urlsForUser(ue65ng));

function generateRandomString() {
    let text = "";
    let random = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
    for (var i = 0; i < 6; i++)
        text += random.charAt(Math.floor(Math.random() * random.length));
    return text;
}
//Generates a random string of 6 characters

app.get("/", (req, res) => {
    res.end("Hello!");
});
//Route for / that ends and displays "Hello"

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});
//Shows the json format of the urlDatabase

app.get("/hello", (req, res) => {
    res.end("<html><body>Hello <b>World</b></body></html>\n");
});
//Shows HTML in the route

app.get("/urls", (req, res) => {
    let user_id = req.cookies.user_id; //Variable for user_id to identify user
    let user = users[user_id]; //Sets user as the user_id within the users object
    let userUrls = urlsForUser(user_id);
    let templateVars = {
        urls: userUrls,
        user_id: user_id,
        user: user
    }; //sets TemplateVars object, with urls(database), user_id, and user
    res.render("urls_index", templateVars);
});//renders the urls_index template and passes templateCars as an argument


app.get("/login", (req, res) => {
    let user_id = req.cookies.user_id;
    let user = users[user_id];
    let templateVars = {
        user: user
    };
    res.render("login", templateVars);
});

app.get("/register", (req, res) => {
    let user_id = req.cookies.user_id;
    let user = users[user_id];
    let templateVars = {
        user: user
    };
    res.render("register", templateVars);
});

app.post("/register", (req, res) => {
    const { email, password } = req.body;

    for (let user_id in users) {
        const user = users[user_id];
        if (user.email === req.body.email) {
            return res.redirect(400, "/register");
        }
    }

    if (req.body.email && req.body.password) {
        let userId = generateRandomString();
        users[userId] = {
            id: userId,
            email: req.body.email,
            password: bcrypt.hashSync(password, 10)
        };
        res.cookie("user_id", userId);
        res.redirect("/urls");
    } else {
        res.redirect(400, "/register");
    }
});

app.get("/urls/new", (req, res) => {
    let user_id = req.cookies.user_id;
    let user = users[user_id];

    if (user) {
        let templateVars = {
            user: user
        };
        res.render("urls_new", templateVars);
    } else {
        res.redirect(400, "/login");
    }
});

app.get("/urls/:id", (req, res) => {
    let user_id = req.cookies.user_id;
    let user = users[user_id];
    let shortURL = req.params.id;
    let templateVars = {
        shortURL: shortURL,
        longURL: urlDatabase[shortURL].longURL,
        user: user
    };
        res.render("urls_shows", templateVars)
});

app.post("/urls/:id/delete", (req, res) => {
    if (user) {
        let templateVars = {
            user: user
        };
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
    } else {
    res.redirect(400, "/login");
    }
});

app.post("/urls", (req, res) => {
    let shortURL = generateRandomString();
    urlDatabase[shortURL] = {
        shortURL: shortURL,
        longURL: req.body.longURL,
        uid: req.cookies.user_id
    }
    res.redirect(`/urls/${shortURL}`)
    console.log(urlDatabase);
    console.log(users);
});

app.post("/urls/:id/update", (req, res) => {
    urlDatabase[req.params.id].longURL = req.body.longURL;
    res.redirect(`/urls/${req.params.id}`);
})


app.get("/u/:shortURL", (req, res) => {
    let longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
});


function checkUserEmail(email){
    for(var key in users){
        if(users[key].email===email){
            return users[key];
        }
    }
}
app.post("/login", (req, res) => {
    const {email, password} = req.body;
    var result = checkUserEmail(req.body.email); //Check if user exists
    if(result) { //means the user email exists
    if(bcrypt.compareSync(req.body.password, result.password)) { //check if password matches hashed password
        res.cookie("user_id", result.id);
        res.redirect('/urls');
        } else { //password does not match
            res.send(400, "/login");
        }
        } else { //user email does not exist
            res.send(403, "/register");
        }
    });


app.post("/logout", (req, res) => {
        res.clearCookie("user_id");
        res.redirect("/urls");
    });

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);

});




