const { assert } = require("chai");

const { getUserByEmail } = require("../helpers");

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
