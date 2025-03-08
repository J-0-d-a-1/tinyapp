const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const {
  generateRandomString,
  createUser,
  getUserByEmail,
  authenticateUser,
  urlsForUser,
  // checkTheURLExist,
} = require("./helpers");

// telling express app to use ejs as its templating engine
app.set("view engine", "ejs");

// getting ready for the POST
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));

// to use cookieParse for getting username from cookie
app.use(cookieParser());
// Encrypt / Decrypt the content of the 'session' cookie
app.use(
  cookieSession({
    name: "session",
    keys: ["This app is created by feature web developer"],
  })
);

const urlDatabase = {
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "userRandomID" },
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

// rout for /
app.get("/", (req, res) => {
  const id = req.session.id;

  if (!id) {
    return res.redirect("/register");
  }

  return res.redirect("/login");
});

// rout for /urls
app.get("/urls", (req, res) => {
  // res.clearCookie("");
  const id = req.session.id;
  if (!id) {
    return res.send("You need to loggin or register first!");
  }
  const email = users[id]["email"];
  const { error, data } = getUserByEmail(users, email);

  const urls = urlsForUser(urlDatabase, id).data;
  const templateVars = {
    user_id: data.id,
    user_email: data.email,
    urls,
  };
  return res.render("urls_index", templateVars);
});

// rout for /urls/new
app.get("/urls/new", (req, res) => {
  const id = req.session.id;
  if (!id) {
    return res.redirect("/login");
  }
  const email = users[id].email;
  const { data } = getUserByEmail(users, email);

  const templateVars = {
    user_id: data.id,
    user_email: data.email,
  };

  req.session.id = data.id;
  return res.render("urls_new", templateVars);
});

// rout for /urls/:id
app.get("/urls/:id", (req, res) => {
  // userId
  const userId = req.session.id;
  if (!userId) {
    return res.status(300).send("You need to loggin");
  }
  if (!users[userId]) {
    return res.status(400).send("You need to register");
  }
  const email = users[userId].email;
  if (!email) {
    return res.send("Please log in");
  }

  const { data } = getUserByEmail(users, email);

  // shortURL
  const id = req.params.id;

  if (!Object.values(urlDatabase[id]).includes(userId)) {
    return res.send("This is not yours");
  }

  const templateVars = {
    user_id: data.id,
    user_email: data.email,
    id,
    longURL: urlDatabase[id].longURL,
  };

  return res.render("urls_show", templateVars);
});

// rout for shareable short url of redirection (/u/:id)
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const actualURL = urlDatabase[shortURL].longURL;
  if (!actualURL) {
    return res.status(404).send("Page Not Found");
  }

  return res.redirect(actualURL);
});

// app.get("/urls.json", (req, res) => {
//   return res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   return res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

// rout that will match POST request from form
app.post("/urls", (req, res) => {
  const id = req.session.id;
  if (!id) {
    return res.send("You need to login!");
  }
  const { error, data } = getUserByEmail(users, users[id].email);

  const newId = generateRandomString();
  urlDatabase[newId] = { longURL: req.body.longURL, userID: data.id };
  return res.redirect(`/urls/${newId}`);
});

// to remove a URL from post /urls/:id/delete
app.post("/urls/:id/delete", (req, res) => {
  // userId
  const userId = req.session.id;
  if (!userId) {
    return res.status(400).send("You need to loggin");
  }

  const shortURL = req.params.id;

  delete urlDatabase[shortURL];
  return res.redirect("/urls");
});

// to edit a url from /urls/:id/edit
app.post("/urls/:id/edit", (req, res) => {
  // if (!urlDatabase[req.params.id]) {
  //   return res.status(404).send("the URL is invalid");
  // }

  console.log(req.params.id);

  const id = req.params.id;
  console.log(urlDatabase[req.params.id].longURL);
  const editedURL = req.body[id];
  console.log(editedURL);

  urlDatabase[req.params.id].longURL = editedURL;
  return res.redirect("/urls");
});

// Login form /login
app.get("/login", (req, res) => {
  const id = req.session.id;
  if (id) {
    return res.redirect("/urls");
  }

  const templateVars = {
    user: users[req.session.id],
  };
  return res.render("login.ejs", templateVars);
});

// to login /login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const { error, data } = authenticateUser(users, email, password);

  if (error) {
    return res.status(403).send(error);
  }

  req.session.id = data.id;
  return res.redirect("/urls");
});

// to logout /logout
app.post("/logout", (req, res) => {
  // to clear the cookie with using
  // res.clearCookie("session");
  req.session = null;
  return res.redirect("/login");
});

// route for /register
app.get("/register", (req, res) => {
  const id = req.session.id;
  if (id) {
    return res.redirect("/login");
  }

  return res.render("register");
});

// to register /register
app.post("/register", (req, res) => {
  //extract email from cookkie
  const { email, password } = req.body;
  console.log(email, password);

  // handling empty field
  if (!email || !password) {
    return res.status(400).send("Email and password are required");
  }

  const { error, data } = getUserByEmail(users, email);
  console.log(error, data);
  // handling existing email
  if (!error) {
    return res.send("The email is already registered");
  }

  const newUserData = { email, password };

  const newUserResult = createUser(users, newUserData);

  // handling invalid empty field
  if (newUserResult.error) {
    return res.status(400).send(newUserResult.error);
  }
  req.session.id = newUserResult.data.id;
  return res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
