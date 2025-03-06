// returns a string of 6 random alphanumeric characthers
const generateRandomString = function () {
  const random6Letters = Math.random().toString(36).slice(2, 8);
  return random6Letters;
};

// to find user by Email
const getUserByEmail = (users, email) => {
  let user;

  // iterate the users object to find matching email
  for (const userId in users) {
    if (users[userId].email === email) {
      user = users[userId];
      return { error: null, data: user };
    }
  }

  return { error: "No user matching", data: null };
};

const authenticateUser = (users, email, password) => {
  let user;

  for (const userId in users) {
    if (users[userId].email === email) {
      user = users[userId];
    }
  }

  if (!user) {
    return { error: "No user exist", data: null };
  }

  if (user.password !== password) {
    return { error: "invalid password", data: null };
  }

  return { error: null, data: user };
};

// console.log(
//   authenticateUser(users, "user@example.com", "purple-monkey-dinosaur")
// );

const createUser = (users, newUserData) => {
  const newId = generateRandomString();

  const newUser = {
    id: newId,
    email: newUserData.email,
    password: newUserData.password,
  };

  // checking if there is any empty value
  const isInvalid =
    Object.values(newUser).filter((data) => data === "").length > 0;

  if (isInvalid) {
    return { error: "Fields are empty", data: null };
  }

  users[newUser.id] = newUser;

  return { error: null, data: newUser };
};
// const users = {
//   userRandomID: {
//     id: "userRandomID",
//     email: "user@example.com",
//     password: "purple-monkey-dinosaur",
//   },
//   user2RandomID: {
//     id: "user2RandomID",
//     email: "user2@example.com",
//     password: "dishwasher-funk",
//   },
// };
// const urlDatabase = {
//   b2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
//   "9sm5xK": { longURL: "http://www.google.com", userID: "userRandomID" },
// };

const urlsForUser = (database, id) => {
  const matchedURLs = {};

  for (const shortURL in database) {
    const data = database[shortURL];
    for (const key in data) {
      if (key === "userID") {
        if (data[key] === id) {
          matchedURLs[shortURL] = data["longURL"];
        }
      }
    }
  }

  if (Object.keys(matchedURLs).length === 0) {
    return { error: "No URLs", data: null };
  }

  return { error: null, urls: matchedURLs };
};

const checkTheURLExist = (urls, id) => {
  let resultURL;

  for (const urlsId in urls) {
    if (urlsId === id) {
      resultURL = urlsId;
      return { errorForId: null, urlId: resultURL };
    }
  }

  return { errorForId: "No id exist", urlId: null };
};

// console.log(urlsForUser(urlDatabase, "userRandomID"));
// console.log(urlsForUser(urlDatabase, "user2RandomID"));

module.exports = {
  generateRandomString,
  createUser,
  getUserByEmail,
  authenticateUser,
  urlsForUser,
  checkTheURLExist,
};
