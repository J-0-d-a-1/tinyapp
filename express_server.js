const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

// telling express app to use ejs as its templating engine
app.set("view engine", "ejs");

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

// returns a string of 6 random alphanumeric characthers
const generateRandomString = function () {
  const random6Letters = Math.random().toString(36).slice(2, 8);
  return random6Letters;
};

// getting ready for the POST
app.use(express.urlencoded({ extended: true }));

// to use cookieParse for getting username from cookie
app.use(cookieParser());

// rout for /
app.get("/", (req, res) => {
  return res.send("Hello!");
});

// rout for /urls
app.get("/urls", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase,
  };
  return res.render("urls_index", templateVars);
});

// rout for /urls/new
app.get("/urls/new", (req, res) => {
  return res.render("urls_new");
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

app.get("/urls.json", (req, res) => {
  return res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  return res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// rout that will match POST request from form
app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
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

// to login /login
app.post("/login", (req, res) => {
  // if username exists
  if (req.body.username) {
    // first param is 'username', second param is the value of username
    res.cookie(Object.keys(req.body)[0], req.body.username);
    return res.redirect("/urls");
  }
});

// to logout /logout
app.post("/logout", (req, res) => {
  // need to get the cookie first!!!!!
  res.cookie("username", req.cookies["username"]);
  // to clear the cookie with using username
  res.clearCookie("username");
  return res.redirect("/urls");
});

// route for /register
app.get("/register", (req, res) => {
  return res.render("register");
});

// to register /register
// app.post("/register", (req, res) => {
//   const { email, password } = req.body;

// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
