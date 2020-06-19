const express = require("express");
const mongoose = require("mongoose");
const routes = require("./routes");
const cors = require("cors");
const path = require("path");
const http = require("http");

const app = express();
const server = http.Server(app);

mongoose.connect(
  "mongodb://suddenmotoboy:sudden1012@geonosis.mongodb.umbler.com:44593/sudden?authSource=sudden",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  }
);

app.use(express.json());

app.use("/files", express.static(path.resolve(__dirname, "..", "uploads")));

app.use(routes);

server.listen(3333);
