"use strict";

const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

const connectedMotoboys = {};
const pendingRaces = [];
const currentRaces = [];

io.on("connection", (socket) => {
  const { user_id, user_type } = socket.handshake.query;

  if (user_type === "motoboy") {
    connectedMotoboys[user_id] = { socketId: socket.id, userId: user_id };

    socket.on("setMotoboyLocation", (msg) => {
      const data = JSON.parse(msg);

      connectedMotoboys[data.id].location = data.location;
      connectedMotoboys[data.id].lastTimeOnline = data.lastTimeOnline;

      emitConnectedMotoboys();
    });

    socket.on("findMotoboy", (msg) => {
      const data = JSON.parse(msg);
      pendingRaces.push(data);

      io.emit("pendingRaces", JSON.stringify(pendingRaces));
    });

    socket.on("disconnectMotoboy", (msg) => {
      const data = JSON.parse(msg);

      delete connectedMotoboys[data.id];

      io.emit("connnectedMotoboys", JSON.stringify(connectedMotoboys));
    });
  }
});

const emitConnectedMotoboys = () => {
  io.emit("connnectedMotoboys", JSON.stringify(connectedMotoboys));
};

setInterval(function () {
  const currentTime = new Date();

  for (const motoBoy in connectedMotoboys) {
    if (
      currentTime.getTime() - connectedMotoboys[motoBoy].lastTimeOnline >
      3600000 * 5 // if lastTimeOnline >= 1 hours - Remove user
    )
      delete connectedMotoboys[motoBoy];
  }

  //if (Object.keys(connectedMotoboys).length > 0) emitConnectedMotoboys();
}, 3600000);

http.listen(3000, () => {
  console.log("listening on *:3000");
});
