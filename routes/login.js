const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const getUser = require("../api/utility").getUser;
require("dotenv").config();

const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await getUser(username);
    if (user) {
      if (bcryptjs.compareSync(password, user.password)) {
        res.status(200).send({
          token: jwt.sign({ email: user.email }, process.env.TOKEN_SECRET, {
            expiresIn: process.env.TOKEN_TTL,
          }),
        });
      } else {
        res.status(401).send({ error: "Username or password does not match." });
      }
    } else {
      res.status(401).send({ error: "Username or password does not match." });
    }
  } catch (error) {
    res.status(401).send({ error: "Username or password does not match." });
  }
};

module.exports = { login: login };
