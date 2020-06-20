const express = require("express");
const multer = require("multer");
const uploadConfig = require("./config/upload");
require("dotenv-safe").config();
var jwt = require("jsonwebtoken");

const verifyJWT = (req, res, next) => {
  var token = req.headers["access-token"];
  if (!token)
    return res
      .status(401)
      .json({ auth: false, message: "User not unauthorized" });

  jwt.verify(token, "@SUDDEN#1012platform", function (err, decoded) {
    if (err)
      return res
        .status(401)
        .json({ auth: false, message: "User not unauthorized" });

    // se tudo estiver ok, salva no request para uso posterior
    req.userId = decoded.id;
    next();
  });
};

const MotoboyController = require("./controllers/MotoboyController");
const CompanyController = require("./controllers/CompanyController");

const routes = express.Router();

const upload = multer(uploadConfig);

// Motoboy
routes.post("/motoboy/signin", upload.single("file"), MotoboyController.signin);
routes.post(
  "/motoboy/updatelocation",
  verifyJWT,
  MotoboyController.updateLocation
);
routes.post(
  "/motoboy/setconnection",
  verifyJWT,
  MotoboyController.setMotoboyConnection
);
routes.get(
  "/motoboy/connected",
  verifyJWT,
  MotoboyController.getOnlineMotoboys
);

// Company
routes.get("/company/get", verifyJWT, CompanyController.showAll);
routes.post(
  "/company/create",
  verifyJWT,
  upload.single("file"),
  CompanyController.create
);

module.exports = routes;
