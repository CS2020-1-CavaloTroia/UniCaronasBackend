const { emit } = require("process");
const express = require("express");
const mongoose = require("mongoose");
const routes = require("./src/routes");
const cors = require("cors");
const path = require("path");
const http = require("http");
const MotoboyController = require("./src/controllers/MotoboyController");
const app = express();
const server = http.Server(app);
const io = require("socket.io")(server);

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

const connectedMotoboys = async () => {
  const connected = await MotoboyController.getConnectedMotoboys();
  io.emit("connectedMotoboys", JSON.stringify(connected));
};

setInterval(function () {
  connectedMotoboys();
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

app.get("/", (req, res) => {
  res.send("Page not found");
});

app.use("/files", express.static(path.resolve(__dirname, "..", "uploads")));

app.use(routes);

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3333;
}

server.listen(port, function () {
  console.log(`Server started Successfully on port ${port}`);
});
