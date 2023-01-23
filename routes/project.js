const multiparty = require("multiparty");
const uploadProjectOnS3 = require("../api/aws").uploadProjectOnS3;
const emptyS3Directory = require("../api/aws").emptyS3Directory;
const uploadImageOnS3 = require("../api/aws").uploadImageOnS3;
const { projectsSchema, newProjectSchema } = require("../schemas");

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
    await emptyS3Directory(process.env.BUCKET_NAME, req.body.projectTitle);
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
        async (urls) => {
          const newProject = new newProjectSchema({
            title: fields.title[0],
            subtitle: fields.subtitle[0],
            description: fields.description[0],
            images: urls,
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
    if (err) {
      res.send(err);
    } else {
      if (
        files.images !== undefined &&
        files.images.some((image) => image !== undefined)
      ) {
        let newImages = files.images.filter((image) => image !== undefined);
        let project = await projectsSchema.findById(req.params.id);
        let urls = await uploadProjectOnS3(project.title, newImages);
        projectsSchema
          .findByIdAndUpdate(
            req.params.id,
            {
              $push: { images: urls },
              $set: filteredBody,
            },
            { new: true }
          )
          .then((doc) => {
            res.status(200).send({ message: "Project updated", doc: doc });
          })
          .catch((err) => {
            res
              .status(500)
              .send({ message: "Error updating project", error: err });
          });
      } else {
        projectsSchema
          .findByIdAndUpdate(
            req.params.id,
            {
              $set: filteredBody,
            },
            { new: true }
          )
          .then((doc) => {
            res.status(200).send({ message: "Project updated", doc: doc });
          })
          .catch((err) => {
            res
              .status(500)
              .send({ message: "Error updating project", error: err });
          });
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
