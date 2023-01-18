const { ObjectId } = require("bson");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");

const uri = process.env.MONGODB_URI;

const connectToDB = async () => {
  await mongoose.connect(uri, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    dbName: "rotondo",
  });
};

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(bodyParser.json());

const Users = mongoose.Schema(
  {
    _id: ObjectId,
    username: String,
    password: String,
    email: String,
  },
  { collection: "users" }
);

const usersSchema = mongoose.model("users", Users);

const Projects = mongoose.Schema(
  {
    _id: ObjectId,
    title: String,
    subtitle: String,
    description: String,
    images: Array,
  },
  { collection: "projects" }
);

const projectsSchema = mongoose.model("projects", Projects);

app.get("/projects", (req, res) => {
  projectsSchema.find((err, doc) => {
    if (err) {
      console.log("error");
      res.send(err);
    }
    res.json(doc);
  });
});

app.get("/project/:id", (req, res) => {
  projectsSchema.findById(req.params.id, (err, doc) => {
    if (err) {
      res.send(err);
    }
    res.json(doc);
  });
});

app.get("/aboutus/:lan", (req, res) => {
  const fs = require("fs");
  var aboutUs;
  if (req.params.lan === "en") {
    let rawdata = fs.readFileSync("localization/aboutUsEN.json");
    aboutUs = JSON.parse(rawdata).aboutUs;
  } else if (req.params.lan === "it") {
    let rawdata = fs.readFileSync("localization/aboutUsIT.json");
    aboutUs = JSON.parse(rawdata).aboutUs;
  }
  res.json({ description: aboutUs });
});

app.post("/aboutus/edit/:lan", async (req, res) => {
  const fs = require("fs");
  if (req.params.lan === "en") {
    fs.writeFileSync(
      "localization/aboutUsEN.json",
      JSON.stringify({ aboutUs: req.body.description })
    );
  } else if (req.params.lan === "it") {
    fs.writeFileSync(
      "localization/aboutUsIT.json",
      JSON.stringify({ aboutUs: req.body.description })
    );
  }
});

async function getUser(username) {
  return usersSchema.findOne({
    username: username,
  });
}

app.post("/login", async (req, res) => {
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
});

connectToDB().then(
  () => {
    console.log("DB connected");
    app.listen(process.env.PORT, () => {
      console.log("Server is listening on port " + process.env.PORT + "...");
    });
  },
  (err) => {
    console.log("DB connection error " + err);
  }
);
