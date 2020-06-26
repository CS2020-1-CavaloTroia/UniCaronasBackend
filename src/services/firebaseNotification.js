const fcm = require("fcm-notification");
const FCM = new fcm("../config/firebaseAdmin.json");

module.exports = {
  async sendNotification(title, body, tokens, code) {
    const message = {
      data: {
        code,
      },
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
