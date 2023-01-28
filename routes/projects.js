const { projectsSchema } = require("../schemas");

const getProjects = (req, res) => {
  projectsSchema
    .find((err, doc) => {
      if (err) {
        console.log("error");
        res.send(err);
      }
      res.json(doc);
    })
    .sort({ date: -1 });
};

module.exports = { getProjects: getProjects };
