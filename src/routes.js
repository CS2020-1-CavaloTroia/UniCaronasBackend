const express = require("express");
const multer = require("multer");
const uploadConfig = require("./config/upload");
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
const RaceController = require("./controllers/RaceController");

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
routes.post(
  "/motoboy/subscribeToNotifications",
  verifyJWT,
  MotoboyController.setFirebaseNotificationToken
);
routes.post("/motoboy/races", verifyJWT, MotoboyController.getRaces);
routes.post("/motoboy/user", MotoboyController.getUser);

// Company
routes.post("/company/signin", upload.single("file"), CompanyController.signin);
routes.post("/company/races", verifyJWT, CompanyController.getRaces);
routes.post("/company/user", CompanyController.getUser);

// Routes
routes.post("/race/create", verifyJWT, RaceController.create);
routes.post("/race/start", verifyJWT, RaceController.startRace);

module.exports = routes;
