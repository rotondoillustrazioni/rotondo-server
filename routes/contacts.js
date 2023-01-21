const getContacts = (req, res) => {
  const fs = require("fs");
  let rawdata = fs.readFileSync("localization/contacts.json");
  let contacts = JSON.parse(rawdata);

  res.json(contacts);
};

const editContacts = async (req, res) => {
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
};

module.exports = { getContacts: getContacts, editContacts: editContacts };
