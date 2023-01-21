const mongoose = require("mongoose");
const { ObjectId } = require("bson");
const AWS = require("aws-sdk");

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

async function getUser(username) {
  return usersSchema.findOne({
    username: username,
  });
}

async function uploadProjectOnS3(folderName, images) {
  AWS.config.update({
    region: process.env.REGION,
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  });
  let s3 = new AWS.S3();
  let res = [];
  await Promise.all(
    images.map(async (image) => {
      let url = await uploadImageOnS3(s3, folderName, image);
      res.push(url);
    })
  );
  return res;
}

async function uploadImageOnS3(s3, folderName, image) {
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
}

module.exports = { getUser: getUser, uploadProjectOnS3: uploadProjectOnS3 };
