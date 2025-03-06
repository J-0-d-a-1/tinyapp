const cookieParser = require("cookie-parser");
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
  checkTheURLExist,
} = require("./helpers/userHelpers");

// telling express app to use ejs as its templating engine
app.set("view engine", "ejs");

// getting ready for the POST
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));

// to use cookieParse for getting username from cookie
app.use(cookieParser());

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
  return res.send("Hello!");
});

// rout for /urls
app.get("/urls", (req, res) => {
  // res.clearCookie("user_id");
  const id = req.cookies.user_id;
  if (!id) {
    return res.redirect("login");
  }
  const email = users[id]["email"];
  const { data } = getUserByEmail(users, email);

  const { urls } = urlsForUser(urlDatabase, id);

  const templateVars = {
    user_id: data.id,
    urls,
  };
  return res.render("urls_index", templateVars);
});

// rout for /urls/new
app.get("/urls/new", (req, res) => {
  const id = req.cookies.user_id;
  if (!id) {
    return res.redirect("/login");
  }
  const email = users[id].email;
  const { data } = getUserByEmail(users, email);

  const templateVars = {
    user_id: data.id,
  };

  return res.render("urls_new", templateVars);
});

// rout for /urls/:id
app.get("/urls/:id", (req, res) => {
  const userId = req.cookies.user_id;

  if (!userId) {
    return res.status(300).send("You need to loggin");
  }
  const { email } = users[userId];
  if (!users[userId]) {
    return res.status(400).send("You need to register");
  }

  const { data } = getUserByEmail(users, email);
  const { error, urls } = urlsForUser(urlDatabase, data.id);

  const id = req.params.id;
  const { errorForId, urlId } = checkTheURLExist(urls, id);
  if (error) {
    if (errorForId) {
      return res.status(404).send("Page Not Found!");
    }
    return res.status(400).send("This URL isn't yours!");
  }

  if (!urls[id]) {
    return res.status(404).send("Page Not Found");
  }

  const templateVars = {
    user_id: data.id,
    id: urlId,
    longURL: urls[id],
  };
  return res.render("urls_show", templateVars);
});

// rout for shareable short url of redirection (/u/:id)
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];

  if (!longURL) {
    return res.status(404).send("Page Not Found");
  }

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
  const id = req.cookies.user_id;
  if (!id) {
    return res.send("You need to login");
  }
  const email = users[id].email;
  const { data } = getUserByEmail(users, email);

  const newId = generateRandomString();
  urlDatabase[newId] = req.body.longURL;
  return res.redirect(`/urls/${newId}`);
});

// to remove a URL from post /urls/:id/delete
app.post("/urls/:id/delete", (req, res) => {
  const userId = req.cookies.user_id;
  if (!userId) {
    return res.status(400).send("You need to loggin");
  }

  const { email } = users[userId];
  const { data } = getUserByEmail(users, email);
  const { error, urls } = urlsForUser(urlDatabase, data.id);

  const id = req.params.id;
  const { errorForId, urlId } = checkTheURLExist(urls, id);

  if (error) {
    if (errorForId) {
      return res.status(404).send("Page Not Found!");
    }
    return res.status(400).send("This URL isn't yours!");
  }

  delete urlDatabase[urlId];
  return res.redirect("/urls");
});

// to edit a url from /urls/:id/edit
app.post("/urls/:id/edit", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.status(404).send("the URL is invalid");
  }

  urlDatabase[req.params.id] = req.body[req.params.id];
  return res.redirect("/urls");
});

// Login form /login
app.get("/login", (req, res) => {
  const id = req.cookies.user_id;
  if (id) {
    return res.redirect("/urls");
  }

  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  return res.render("login.ejs", templateVars);
});

// to login /login
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // bcrypt.compareSync(password, hashedPassword);

  const { error, data } = authenticateUser(users, email, password);

  if (error) {
    // first param is 'username', second param is the value of username
    return res.status(403).send("email or password is invalid!");
  }

  res.cookie("user_id", data.id);
  return res.redirect("/urls");
});

// to logout /logout
app.post("/logout", (req, res) => {
  // to clear the cookie with using user_id
  res.clearCookie("user_id");
  return res.redirect("/login");
});

// route for /register
app.get("/register", (req, res) => {
  const id = req.cookies.user_id;
  if (id) {
    return res.redirect("/login");
  }

  // const email = users[id].email;
  // if (email) {
  //   const { error, data } = getUserByEmail(users, email);

  //   if (!error) {
  //     return res.redirect("urls");
  //   }
  // }

  // const templateVars = {
  //   user_id: data.id,
  // };

  return res.render("register");
});

// to register /register
app.post("/register", (req, res) => {
  //extract email from cookkie
  const { email, password } = req.body;

  // handling empty field
  if (!email || !password) {
    return res.status(400).send("Email and password are required");
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUserData = { email, password: hashedPassword };

  // const result = authenticateUser(users, email, password);
  // // // handling existing email
  // if (!result.error) {
  //   return res.status(400).send("email is already exist!");
  // }

  const newUserResult = createUser(users, newUserData);

  // handling invalid empty field
  if (newUserResult.error) {
    return res.status(400).send(newUserResult.error);
  }
  console.log(users);
  res.cookie("user_id", newUserResult.data.id);
  return res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
