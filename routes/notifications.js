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

const deleteNotification = (req, res) => {
  notificationsSchema.findByIdAndDelete(req.params.id, async (err, doc) => {
    if (err) {
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
  await newNotification.save((err) => {
    if (err) {
      console.log(err);
    }
  });
}

async function lastNotification() {
  return await notificationsSchema.find().sort({ _id: -1 }).limit(1);
}

module.exports = {
  getNotifications: getNotifications,
  saveNotification: saveNotification,
  lastNotification: lastNotification,
  deleteNotification: deleteNotification,
};
