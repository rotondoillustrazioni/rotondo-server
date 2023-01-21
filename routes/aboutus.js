const editAboutUs = async (req, res) => {
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
};

const getAboutUs = (req, res) => {
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
};

module.exports = { editAboutUs: editAboutUs, getAboutUs: getAboutUs };
