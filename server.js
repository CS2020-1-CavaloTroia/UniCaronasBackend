const { emit } = require("process");
const express = require("express");
const mongoose = require("mongoose");
const routes = require("./src/routes");
const cors = require("cors");
const path = require("path");
const http = require("http");
const MotoboyController = require("./src/controllers/MotoboyController");
const RaceController = require("./src/controllers/RaceController");
const app = express();
const server = http.Server(app);
const io = require("socket.io")(server);
const moment = require("moment");
const schedule = require("node-schedule");

const motoboys = {};
const companies = {};

io.on("connection", (socket) => {
  const { user_id, user_type } = socket.handshake.query;

  if (user_type === "motoboy") {
    motoboys[user_id] = { socketId: socket.id, userId: user_id };
  } else if (user_type === "company") {
    companies[user_id] = { socketId: socket.id, userId: user_id };
  }
});

schedule.scheduleJob("0 0 * * *", async () => {
  const motoboys = await MotoboyController.getAllMotoboys();

  motoboys.forEach((value, index) => {
    const now = new Date();
    const fiveMoreDays = new Date();
    fiveMoreDays.setDate(fiveMoreDays.getDate() + 5);

    if (value.nextPayment) {
      if (value.profileStatus === "free") {
        if (now.getTime() < value.nextPayment) {
          MotoboyController.updateProfileStatus(value._id, "awaitingPayment");
        }
      } else if (value.profileStatus === "awaitingPayment") {
        if (fiveMoreDays.getTime() < value.nextPayment) {
          MotoboyController.updateProfileStatus(value._id, "block");
        }
      }
    } else {
      const paymentDate = new Date();
      paymentDate.setDate(paymentDate.getDate() + 2);
      MotoboyController.updateNextPayment(value._id, paymentDate.getTime());
    }
  });
});

const connectedMotoboys = async () => {
  const connected = await MotoboyController.getConnectedMotoboys();
  io.emit("connectedMotoboys", JSON.stringify(connected));
};

const updateConnectedMotoboys = async () => {
  try {
    const motoboys = await MotoboyController.getConnectedMotoboys();

    motoboys.forEach((value, index) => {
      if (value.lastTimeOnline) {
        const past = moment(value.lastTimeOnline);
        const now = moment(new Date());
        const duration = moment.duration(now.diff(past));

        if (duration.asSeconds() > 30) {
          MotoboyController.setToOffline(value._id);
        }
      } else {
        MotoboyController.setToOffline(value._id);
      }
    });
  } catch (err) {
    console.log(err);
  }
};

const resendNotificationForAwaintingRaces = async () => {
  try {
    const races = await RaceController.getAwaitingRaces();

    races.forEach((value, index) => {
      if (value.initiated_at) {
        const past = moment(value.initiated_at);
        const now = moment(new Date());
        const duration = moment.duration(now.diff(past));

        if (duration.asSeconds() > 14 && value.sentTo !== "all") {
          RaceController.resendNotificationForAwaintingRaces(value);
        }
      }
    });
  } catch (err) {
    console.log(err);
  }
};

setInterval(() => {
  connectedMotoboys();
}, 1000);

setInterval(() => {
  updateConnectedMotoboys();
  resendNotificationForAwaintingRaces();
}, 5000);

mongoose.connect(
  "mongodb+srv://sudden:suden1012jipa@cluster0-lq2a6.gcp.mongodb.net/sudden?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  }
);

app.use(express.json());

app.use("/files", express.static(path.resolve(__dirname, "..", "uploads")));

app.use(routes);

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3333;
}

server.listen(port, function () {
  console.log(`Server started Successfully on port ${port}`);
});
