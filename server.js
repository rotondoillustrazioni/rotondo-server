const { ObjectId } = require("bson");
var express = require("express");
var app = express();
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

app.use(express.json({ extended: false }));

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

// app.get("/users/:id", function (req, res) {
//   User.findById(req.params.id, function (err, doc) {
//     if (err) {
//       res.send(err);
//     }
//     res.json(doc);
//   });
// });

app.listen(process.env.PORT, () => {
  console.log("Server is listening");
});
