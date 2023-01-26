const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();

const { expressjwt: expressJwt } = require("express-jwt");
const bodyParser = require("body-parser");
const cors = require("cors");

const { login } = require("./routes/login");
const { editAboutUs, getAboutUs } = require("./routes/aboutus");
const { getContacts, editContacts } = require("./routes/contacts");
const { getProjects } = require("./routes/projects");
const {
  getNotifications,
  saveNotification,
  lastNotification,
  deleteNotification,
  editNotification,
} = require("./routes/notifications");
const server = require("http").createServer(app);
options = {
  cors: true,
};
const io = require("socket.io")(server, options);

const {
  getProject,
  deleteProject,
  newProject,
  editProject,
} = require("./routes/project");

const uri = process.env.MONGODB_URI;

mongoose.set("useFindAndModify", false);
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
    method: ["GET"], // TODO: delete
    path: [
      "/login",
      "/notification/new" /* "/aboutus", "/contacts", "/projects"*/,
    ],
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
// app.get("/projects/admin", getProjects);

app.get("/project/:id", getProject);
app.delete("/project/delete/:id", deleteProject);
app.put("/project/new", newProject);
app.post("/project/edit/:id", editProject);

app.get("/aboutus/:lan", getAboutUs);
// app.get("/aboutus/admin/:lan", getAboutUs);
app.post("/aboutus/edit/:lan", editAboutUs);

app.get("/contacts/", getContacts);
// app.get("/contacts/admin", getContacts);
app.post("/contacts/edit/:contact", editContacts);

app.get("/notifications", getNotifications);
app.delete("/notifications/delete/:id", deleteNotification);
app.post("/notifications/edit/:id", editNotification);

app.post("/login", login);

io.on("connection", (socket) => {
  console.log("New client connected ", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });

  socket.on("message-values", async (data) => {
    await saveNotification(data);
    await lastNotification().then((result) => {
      io.emit("new_notification", result);
    });
  });
});

connectToDB().then(
  () => {
    console.log("DB connected");
    server.listen(process.env.PORT, () => {
      console.log("Server is listening on port " + process.env.PORT + "...");
    });
  },
  (err) => {
    console.log("DB connection error " + err);
  }
);
