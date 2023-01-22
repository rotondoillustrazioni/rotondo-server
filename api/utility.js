const { usersSchema } = require("../schemas");

async function getUser(username) {
  return usersSchema.findOne({
    username: username,
  });
}

module.exports = { getUser: getUser };
