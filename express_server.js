const express = require("express"); //Requires Express
const app = express(); //calls the Express function
const PORT = process.env.PORT || 8080; // Sets default port at 8080
// const cookieParser = require('cookie-parser'); //Requires cookieParser
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session')

//Sets view engine to EJS
app.set("view engine", "ejs");
//uses cookieSession
app.use(cookieSession({
  name: 'session',
  keys: ['meow'],

  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

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

function generateRandomString() {
    let text = "";
    let random = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
    for (var i = 0; i < 6; i++)
        text += random.charAt(Math.floor(Math.random() * random.length));
    return text;
}

//Checks that the user_id belongs to the url
function urlsForUser(user_id) {
    let newDB = {}
    for (let shortURL in urlDatabase) {
        if (user_id === urlDatabase[shortURL].uid) {
            newDB[shortURL] = urlDatabase[shortURL].longURL;
        }
    }
 return newDB;
}

function checkUserEmail(email){
    for(var key in users){
        if(users[key].email===email){
            return users[key];
        }
    }
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
    let user_id = req.session.user_id; //Variable for user_id to identify user
    let user = users[user_id]; //Sets user as the user_id within the users object
    let userUrls = urlsForUser(user_id);
    let templateVars = {
        urls: userUrls,
        user_id: user_id,
        user: user
    };
    if (user) {
        res.render("urls_index", templateVars);
    } else {
        res.status(400).send('Please <a href="/login">login</a> or <a href="/register">register</a>.');
    }
});

app.get("/login", (req, res) => {
    let user_id = req.session.user_id;
    let user = users[user_id];
    let templateVars = {
        user: user
    };
    res.render("login", templateVars);
});

app.get("/register", (req, res) => {
    let user_id = req.session.user_id;
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
            return res.status(400).send('User exists, please <a href="/login">login</a>.')
        }
    }

    if (req.body.email && req.body.password) {
        let userId = generateRandomString();
        users[userId] = {
            id: userId,
            email: req.body.email,
            password: bcrypt.hashSync(password, 10)
        };
        req.session.user_id = userId;
        res.redirect("/urls");
    } else {
        res.status(400).send('Looks like you left some fields blank. Please <a href="/register">register</a> again.')
    }
});

app.get("/urls/new", (req, res) => {
    let user_id = req.session.user_id;
    let user = users[user_id];

    if (user) {
        let templateVars = {
            user: user
        };
        res.render("urls_new", templateVars);
    } else {
        res.status(400).send('Access forbidden. Please <a href="/login">login</a> to proceed.');
    }
});

app.get("/urls/:id", (req, res) => {
    let user_id = req.session.user_id;
    let user = users[user_id];
    let shortURL = req.params.id;

    if (user) {
        let templateVars = {
        shortURL: shortURL,
        longURL: urlDatabase[shortURL].longURL,
        user: user,
        };
        res.render("urls_shows", templateVars)
    } else {
        res.status(400).send('Access forbidden. Please <a href="/login">login</a> to proceed.');
    }

});

app.post("/urls/:id/delete", (req, res) => {
    let user_id = req.session.user_id;
    let user = users[user_id];
    let templateVars = {
        user: user
    };
    if (user) {
        delete urlDatabase[req.params.id];
        res.redirect("/urls");
    } else {
        res.status(400).send('Access forbidden. Please <a href="/login">login</a> to proceed.')
    }
});

app.post("/urls", (req, res) => {
    let shortURL = generateRandomString();
    urlDatabase[shortURL] = {
        shortURL: shortURL,
        longURL: req.body.longURL,
        uid: req.session.user_id
    }
    res.redirect(`/urls/${shortURL}`)
});

app.post("/urls/:id/update", (req, res) => {
    urlDatabase[req.params.id].longURL = req.body.longURL;
    res.redirect(`/urls/${req.params.id}`);
})


app.get("/u/:shortURL", (req, res) => {
    let longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
});


app.post("/login", (req, res) => {
    const {email, password} = req.body;
    var result = checkUserEmail(req.body.email); //Check if user exists
    if(result) { //means the user email exists
    if(bcrypt.compareSync(req.body.password, result.password)) { //check if password matches hashed password
        req.session.user_id = result.id;
        res.redirect('/urls');
        } else { //password does not match
            res.status(400).send('Incorrect details. Please <a href="/login">login</a>.')
        }
        } else { //user email does not exist
            res.status(403).send('Email does not exist in the system. Please <a href="/register">register</a> to proceed.')
        }
    });


app.post("/logout", (req, res) => {
        req.session = null;
        res.redirect("/urls");
    });

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);

});




