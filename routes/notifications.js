const { notificationsSchema, newNotificationSchema } = require("../schemas");

const getNotifications = (req, res) => {
  notificationsSchema.find((err, doc) => {
    if (err) {
      console.log("error");
      res.send(err);
    }
    res.json(doc);
  });
};

async function saveNotification(data) {
  const newNotification = new newNotificationSchema({
    name: data.name,
    title: data.title,
    email: data.email,
    description: data.description,
    date: new Date(Date.now()),
    read: false,
  });
  newNotification.save((err) => {
    if (err) {
      console.log(err);
    }
  });
}

module.exports = {
  getNotifications: getNotifications,
  saveNotification: saveNotification,
};
