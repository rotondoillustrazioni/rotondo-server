const { ObjectId } = require("bson");
const express = require("express");
const app = express();
const mongoose = require("mongoose");

const uri =
  process.env.MONGODB_URI;

const connectDB = async () => {
  await mongoose.connect(uri, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  });
  console.log("DB connected");
};

connectDB();

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

const projectSchema = mongoose.Schema(
  { _id: ObjectId, title: String, description: String, images: Array },
  { collection: "project" }
);

const Project = mongoose.model("project", projectSchema);

app.get("/projects", async (req, res) => {
  Project.find({}, (err, doc) => {
    if (err) {
      res.send(err);
      console.log("error");
    }
    res.json(doc);
  });
});

app.get("/project/:id", (req, res) => {
  Project.findById(req.params.id, (err, doc) => {
    if (err) {
      res.send(err);
    }
    res.json(doc);
  });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server is listening");
});
