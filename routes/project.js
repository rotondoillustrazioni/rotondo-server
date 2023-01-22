const multiparty = require("multiparty");
const uploadProjectOnS3 = require("../api/aws").uploadProjectOnS3;
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
  projectsSchema.findByIdAndDelete(req.params.id, (err, doc) => {
    if (err) {
      res.send(err);
    }
    res.json(doc);
  });
  // delete the AWS S3 project
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
              res.status(500).send({ message: "Error" });
            } else {
              res.status(200).send({ message: "New Project added" });
            }
          });
        }
      );
    }
  });
};

module.exports = {
  getProject: getProject,
  deleteProject: deleteProject,
  newProject: newProject,
};