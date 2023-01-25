const { notificationsSchema, newNotificationsSchema } = require("../schemas");

const getNotifications = (req, res) => {
  notificationsSchema.find((err, doc) => {
    if (err) {
      console.log("error");
      res.send(err);
    }
    res.json(doc);
  });
};

const newNotification = (req, res) => {
  const { email, title, description, date, read } = req.body;
  const newNotification = new newNotificationsSchema({
    email,
    title,
    description,
    date,
    read,
  });
  newNotification.save((err) => {
    if (err) {
      console.log(err);
      res.status(500).send({ message: "Error", error: err });
    } else {
      res.status(200).send({ message: "New notification added" });
    }
  });
};

module.exports = {
  getNotifications: getNotifications,
  newNotification: newNotification,
};
