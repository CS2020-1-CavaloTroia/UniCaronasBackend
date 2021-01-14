const fcm = require("fcm-notification");
// const FCM = new fcm(
//   "/Users/fernandoseverino/Documents/projects/Sudden/firebaseKey.json"
// );
const FCM = new fcm("firebaseKey.json");

module.exports = {
  async sendNotification(title, body, tokens, data) {
    const message = {
      android: {
        notification: {
          icon: "ic_notification",
          color: "#3F0072",
        },
      },
      data: JSON.stringify(data),
      notification: {
        title,
        body,
      },
    };

    FCM.sendToMultipleToken(message, tokens, function (err, response) {
      if (err) {
        console.log("err--", err);
      } else {
        console.log("response-----", response);
      }
    });
  },
};
