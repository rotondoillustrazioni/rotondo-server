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

const Notifications = mongoose.Schema(
  {
    _id: ObjectId,
    name: String,
    email: String,
    title: String,
    description: String,
    date: Date,
    read: Boolean,
  },
  { collection: "notifications" }
);

const notificationsSchema = mongoose.model("notifications", Notifications);

const NewNotification = mongoose.Schema(
  {
    name: String,
    email: String,
    title: String,
    description: String,
    date: Date,
    read: Boolean,
  },
  { collection: "notifications" }
);

const newNotificationSchema = mongoose.model(
  "newNotification",
  NewNotification
);

module.exports = {
  projectsSchema,
  usersSchema,
  newProjectSchema,
  notificationsSchema,
  newNotificationSchema,
};
