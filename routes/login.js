const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const getUser = require("../api/utility").getUser;
const { usersSchema } = require("../schemas");
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

const changePassword = async (req, res) => {
  const newPassword = req.body.newPassword;
  const user = await getUser("admin");
  if (user) {
    const salt = bcryptjs.genSaltSync();
    const hash = bcryptjs.hashSync(newPassword, salt);

    await usersSchema.findByIdAndUpdate(
      user._id,
      { password: hash },
      { new: true },
      (err, doc) => {
        if (err) {
          res.status(401).send({ error: "Error in changing password" });
        }
        res.status(200).send({ message: "Password changed" });
      }
    );
  } else {
    res.status(401).send({ error: "Error in changing password" });
  }
};

module.exports = { login: login, changePassword: changePassword };
