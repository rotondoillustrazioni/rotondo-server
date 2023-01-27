const multiparty = require("multiparty");
const uploadProjectOnS3 = require("../api/aws").uploadProjectOnS3;
const emptyS3Directory = require("../api/aws").emptyS3Directory;
const { projectsSchema, newProjectSchema } = require("../schemas");
const { deleteImageOnS3 } = require("../api/aws");
const mongoose = require("mongoose");

const getProject = (req, res) => {
  projectsSchema.findById(req.params.id, (err, doc) => {
    if (err) {
      res.send(err);
    }
    res.json(doc);
  });
};

const deleteProject = (req, res) => {
  projectsSchema.findByIdAndDelete(req.params.id, async (err, doc) => {
    if (err) {
      res.send(err);
    }
    // delete the AWS S3 project
    await emptyS3Directory(req.body.projectTitle);
    res.json(doc);
  });
};

const newProject = async (req, res) => {
  var form = new multiparty.Form();
  form.parse(req, async function (err, fields, files) {
    if (err) {
      res.send(err);
    } else {
      await uploadProjectOnS3(fields.title[0], files.images).then(
        async (imgsObjs) => {
          const newProject = new newProjectSchema({
            title: fields.title[0],
            subtitle: fields.subtitle[0],
            description: fields.description[0],
            descriptionIT: fields.descriptionIT[0],
            images: imgsObjs,
          });
          await newProject.save((err) => {
            if (err) {
              console.log(err);
              res.status(500).send({ message: "Error", error: err });
            } else {
              res.status(200).send({ message: "New Project added" });
            }
          });
        }
      );
    }
  });
};

const editProject = (req, res) => {
  var form = new multiparty.Form();
  form.parse(req, async (err, fields, files) => {
    let filteredBody = {};
    if (fields.subtitle[0] !== "undefined") {
      filteredBody["subtitle"] = fields.subtitle[0];
    }
    if (fields.description[0] !== "undefined") {
      filteredBody["description"] = fields.description[0];
    }

    if (fields.descriptionIT[0] !== "undefined") {
      filteredBody["descriptionIT"] = fields.descriptionIT[0];
    }
    if (err) {
      res.send(err);
    } else {
      try {
        if (
          files.images !== undefined &&
          files.images.some((image) => image !== undefined)
        ) {
          let newImages = files.images.filter((image) => image !== undefined);
          let project = await projectsSchema.findById(req.params.id);
          let imgsObjs = await uploadProjectOnS3(project.title, newImages);
          imgsObjs.map(async (i) => {
            let newImgObj = {
              _id: new mongoose.Types.ObjectId(),
              fileName: i.fileName,
              url: i.url,
            };
            await projectsSchema.findByIdAndUpdate(
              req.params.id,
              {
                $push: { images: newImgObj },
                // $set: filteredBody,
              },
              { new: true }
            );
          });
        }
        if (fields.deletedImages !== undefined) {
          let deletedImages = fields.deletedImages.map((i) => JSON.parse(i));
          await Promise.all(
            deletedImages.map(async (di) => {
              await deleteImageOnS3(di.projectName, di.originalFilename);
              await projectsSchema.findByIdAndUpdate(
                req.params.id,
                {
                  $pull: { images: { fileName: di.originalFilename } },
                  // $set: filteredBody,
                },
                { new: true }
              );
            })
          );
        }
        await projectsSchema
          .findByIdAndUpdate(
            req.params.id,
            {
              $set: filteredBody,
            },
            { new: true }
          )
          .then((doc) => {
            res.status(200).send({ message: "Project updated", doc: doc });
          });
      } catch (err) {
        res.status(500).send({ message: "Error updating project", error: err });
      }
    }
  });
};

module.exports = {
  getProject: getProject,
  deleteProject: deleteProject,
  newProject: newProject,
  editProject: editProject,
};
