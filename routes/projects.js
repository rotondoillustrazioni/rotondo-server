const { projectsSchema } = require("../schemas");

const getProjects = (req, res) => {
  projectsSchema.find((err, doc) => {
    if (err) {
      console.log("error");
      res.send(err);
    }
    res.json(doc);
  });
};

module.exports = { getProjects: getProjects };
