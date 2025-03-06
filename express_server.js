const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const {
  generateRandomString,
  createUser,
  getUserByEmail,
} = require("./helpers/userHelpers");

// telling express app to use ejs as its templating engine
app.set("view engine", "ejs");

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

// getting ready for the POST
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));

// to use cookieParse for getting username from cookie
app.use(cookieParser());

// rout for /
app.get("/", (req, res) => {
  return res.send("Hello!");
});

// rout for /urls
app.get("/urls", (req, res) => {
  // res.clearCookie("user_id");

  const templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase,
  };
  return res.render("urls_index", templateVars);
});

// rout for /urls/new
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };

  return res.render("urls_new", templateVars);
});

// rout for /urls/:id
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
  };
  return res.render("urls_show", templateVars);
});

// rout for shareable short url of redirection (/u/:id)
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  return res.redirect(longURL);
});

// app.get("/urls.json", (req, res) => {
//   return res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   return res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

// rout that will match POST request from form
app.post("/urls", (req, res) => {
  const newId = generateRandomString();
  urlDatabase[newId] = req.body.longURL;
  return res.redirect(`/urls/${newId}`);
});

// to remove a URL from post /urls/:id/delete
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  return res.redirect("/urls");
});

// to edit a url from /urls/:id/edit
app.post("/urls/:id/edit", (req, res) => {
  urlDatabase[req.params.id] = req.body[req.params.id];
  return res.redirect("/urls");
});

// Login form /login
app.get("/login", (req, res) => {
  return res.render("login.ejs");
});

// to login /login
app.post("/login", (req, res) => {
  const { error, user } = getUserByEmail(users, req.body.email);

  if (error) {
    return res.sendStatus("400");
  }
  // first param is 'username', second param is the value of username
  res.cookie("id", user.id);
  return res.redirect("/urls");
});

// to logout /logout
app.post("/logout", (req, res) => {
  // need to get the cookie first!!!!!
  res.cookie("user_id", req.cookies["user_id"]);
  // to clear the cookie with using username
  res.clearCookie("user_id");
  return res.redirect("/urls");
});

// route for /register
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };

  return res.render("register", templateVars);
});

// to register /register
app.post("/register", (req, res) => {
  //extract email from cookkie
  const email = req.body.email;
  const password = req.body.password;

  // handling empty field
  if (!email || !password) {
    return res.status(400).send("Email and password are required");
  }

  const { errorForNoUser } = getUserByEmail(users, email);

  // handling existing email
  if (!errorForNoUser) {
    return res.status(400).send(errorForNoUser);
  }

  const { error, user } = createUser(users, req.body);

  if (error) {
    return res.status(400).send(error);
  }

  res.cookie("user_id", user.id);
  return res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
