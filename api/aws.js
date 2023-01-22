const AWS = require("aws-sdk");

AWS.config.update({
  region: process.env.REGION,
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
});
let s3 = new AWS.S3();

async function uploadProjectOnS3(folderName, images) {
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

async function emptyS3Directory(bucket, dir) {
  const listParams = {
    Bucket: bucket,
    Prefix: dir,
  };

  const listedObjects = await s3.listObjectsV2(listParams).promise();

  if (listedObjects.Contents.length === 0) return;

  const deleteParams = {
    Bucket: bucket,
    Delete: { Objects: [] },
  };

  listedObjects.Contents.forEach(({ Key }) => {
    deleteParams.Delete.Objects.push({ Key });
  });

  await s3.deleteObjects(deleteParams).promise();

  if (listedObjects.IsTruncated) await emptyS3Directory(bucket, dir);
}

module.exports = {
  uploadProjectOnS3: uploadProjectOnS3,
  emptyS3Directory: emptyS3Directory,
};
