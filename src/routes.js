const express = require("express");
const multer = require("multer");
const uploadConfig = require("./config/upload");

const MotoboyController = require("./controllers/MotoboyController");
const CompanyController = require("./controllers/CompanyController");

const routes = express.Router();

const upload = multer(uploadConfig);

// index
routes.get("/", (req, res) => {
  return res.json("Olá");
});

// Motoboy
routes.post("/motoboy/create", upload.single("file"), MotoboyController.create);
routes.post("/motoboy/updatelocation", MotoboyController.updateLocation);
routes.post("/motoboy/setconnection", MotoboyController.setMotoboyConnection);
routes.get("/motoboy/connected", MotoboyController.getOnlineMotoboys);

// Company
routes.get("/company/get", CompanyController.showAll);
routes.post("/company/create", upload.single("file"), CompanyController.create);

module.exports = routes;
