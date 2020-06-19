const express = require("express");
const mongoose = require("mongoose");
const routes = require("./src/routes");
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

app.get("/", (req, res) => {
  return res.json("Olá");
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
