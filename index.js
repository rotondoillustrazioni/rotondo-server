const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();
const login = require("./routes/login");

const { expressjwt: expressJwt } = require("express-jwt");
const bodyParser = require("body-parser");
const cors = require("cors");

const { editAboutUs, getAboutUs } = require("./routes/aboutus");
const { getContacts, editContacts } = require("./routes/contacts");
const { getProjects } = require("./routes/projects");
const { getProject, deleteProject, newProject } = require("./routes/project");

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

app.use(
  expressJwt({
    secret: process.env.TOKEN_SECRET,
    algorithms: ["HS256"],
  }).unless({
    method: ["GET"],
    path: ["/login"],
  })
);

app.use((err, req, res, next) => {
  if (err.name === "UnauthorizedError") {
    res.status(401).send({ error: "No valid authorization token found." });
  } else {
    res.status(500).send({ error: err.message });
  }
});

app.use(bodyParser.json());
app.use(cors());

app.get("/projects", getProjects);
app.get("/project/:id", getProject);
app.delete("/project/delete/:id", deleteProject);
app.put("/project/new", newProject);

app.get("/aboutus/:lan", getAboutUs);
app.post("/aboutus/edit/:lan", editAboutUs);

app.get("/contacts/", getContacts);
app.post("/contacts/edit/:contact", editContacts);

app.post("/login", login.login);

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
