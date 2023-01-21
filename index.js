const { ObjectId } = require("bson");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { expressjwt: expressJwt } = require("express-jwt");
const bodyParser = require("body-parser");
const cors = require("cors");
const multiparty = require("multiparty");
const AWS = require("aws-sdk");

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

app.delete("/project/delete/:id", (req, res) => {
  projectsSchema.findByIdAndDelete(req.params.id, (err, doc) => {
    if (err) {
      res.send(err);
    }
    res.json(doc);
  });
});

app.put("/project/new", (req, res) => {
  var form = new multiparty.Form();
  form.parse(req, function (err, fields, files) {
    if (err) {
      res.send(err);
    } else {
      console.log("QUI ", uploadProjectOnS3(fields.title[0], files.images));

      // upload on db
      res.status(200).send({ message: "New Project added" });
    }
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

app.get("/contacts/", (req, res) => {
  const fs = require("fs");
  let rawdata = fs.readFileSync("localization/contacts.json");
  let contacts = JSON.parse(rawdata);

  res.json(contacts);
});

app.post("/contacts/edit/:contact", async (req, res) => {
  let body = req.body.content;
  const fs = require("fs");
  let content = JSON.parse(
    fs.readFileSync("localization/contacts.json", "utf8")
  );
  if (req.params.contact === "email") {
    content.email = body.email;
  } else if (req.params.contact === "instagram") {
    content.instagram = body.instagram;
  } else if (req.params.contact === "behance") {
    content.behance = body.behance;
  }
  fs.writeFileSync("localization/contacts.json", JSON.stringify(content));
  res.status(200).send({ message: "Contact updated" });
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
  res.status(200).send({ message: "About us updated" });
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

const uploadProjectOnS3 = (folderName, images) => {
  AWS.config.update({
    region: process.env.REGION,
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  });
  let s3 = new AWS.S3();
  var urls = images.map(async (image) => {
    let url = await uploadImageOnS3(s3, folderName, image);
    return url;
  });
  console.log("URLS ", urls);
  return urls;
};

const uploadImageOnS3 = async (s3, folderName, image) => {
  const fs = require("fs");
  const key = folderName + "/" + image.originalFilename;
  let params = {
    Bucket: process.env.BUCKET_NAME,
    Key: key,
    Body: fs.readFileSync(image.path),
    ContentEncoding: "base64",
    ContentType: "image/png",
    ACL: "public-read",
  };
  let data = await s3.upload(params).promise();
  return data.Location;
};
