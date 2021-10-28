const { compare, genSalt, hash } = require('bcryptjs');

const saltAndHash = async (password) => {
  const salt = await genSalt(10);
  return await hash(password, salt);
};

const arePasswordsMatching = async (userInput, hash) => {
  return await compare(userInput, hash);
};

module.exports = { saltAndHash, arePasswordsMatching };
