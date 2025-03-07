const bcrypt = require("bcryptjs");

const userPassward = bcrypt.genSaltSync("purple-monkey-dinosaur", 10);
const user2Passward = bcrypt.genSaltSync("dishwasher-funk", 10);

console.log(userPassward);
console.log(user2Passward);
