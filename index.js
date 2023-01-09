const { ObjectId } = require("bson");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();

const uri = process.env.MONGODB_URI;

const connectToDB = async () => {
  await mongoose
    .connect(uri, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      dbName: "rotondo",
    })
    .then(
      () => {
        console.log("DB connected");
      },
      (err) => {
        console.log("DB connection error " + err);
      }
    );
};

connectToDB();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

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
  projectSchema.findById(req.params.id, (err, doc) => {
    if (err) {
      res.send(err);
    }
    res.json(doc);
  });
});

app.listen(3000, () => {
  console.log("Server is listening...");
});
