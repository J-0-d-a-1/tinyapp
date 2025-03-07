const { assert } = require("chai");

const { getUserByEmail, urlsForUser } = require("../helpers");

const testUsers = {
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

describe("getUserByEmail", function () {
  it("should return a user with valid email", () => {
    const { error, data } = getUserByEmail(testUsers, "user@example.com");
    const expectedUserID = "userRandomID";
    assert.equal(data.id, expectedUserID);
  });

  it("should return a error message with invalid email", () => {
    const { error, data } = getUserByEmail(testUsers, "invalide@email.com");
    const expectedData = null;
    assert.equal(data, expectedData);
  });
});

describe("urlsForUser", function () {
  const urlDatabase = {
    b2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: "user123" },
    "9sm5xK": { longURL: "http://www.google.com", userID: "user456" },
    abc123: { longURL: "http://www.example.com", userID: "user123" },
  };

  it("should return urls that belong to the specified user", function () {
    const result = urlsForUser(urlDatabase, "user123");
    const expectedData = {
      abc123: { longURL: "http://www.example.com", userID: "user123" },
      b2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: "user123" },
    };
    console.log(result.data);
    assert.deepEqual(result.data, expectedData);
  });

  it('should return {error: "No URLs", data: null} if the user has no urls', function () {
    const result = urlsForUser(urlDatabase, "user999");
    const expectedOutput = { error: "No URLs", data: null };
    assert.deepEqual(result, expectedOutput);
  });

  it('should return {error: "No URLs", data: null} if there are no urls in the urlDatabase', function () {
    const result = urlsForUser("user123", {});
    const expectedOutput = { error: "No URLs", data: null };
    assert.deepEqual(result, expectedOutput);
  });

  it("should not return urls that don't belong to the specified user", function () {
    const result = urlsForUser(urlDatabase, "user456");
    const expectedData = {
      "9sm5xK": { longURL: "http://www.google.com", userID: "user456" },
    };
    assert.deepEqual(result.data, expectedData);
  });
});
