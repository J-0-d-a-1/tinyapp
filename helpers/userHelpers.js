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
    } else {
      return { error: "No user matching", data: null };
    }
  }

  return { error: null, data: user };
};

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

module.exports = { generateRandomString, createUser, getUserByEmail };
