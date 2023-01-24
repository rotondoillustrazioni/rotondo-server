const mongoose = require("mongoose");
const { ObjectId } = require("bson");

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

const NewProject = mongoose.Schema(
  {
    title: String,
    subtitle: String,
    description: String,
    images: [
      {
        fileName: String,
        url: String,
      },
    ],
  },
  { collection: "projects" }
);

const newProjectSchema = mongoose.model("newProject", NewProject);

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

module.exports = { projectsSchema, usersSchema, newProjectSchema };
