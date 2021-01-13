const express = require("express");
const multer = require("multer");
const uploadConfig = require("./config/upload");
const googleCloudUpload = require("./config/googleCloudUpload");
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
const PassengerController = require("./controllers/PassengerController");
const RaceController = require("./controllers/RaceController");
const { Router } = require("express");

const routes = express.Router();

const upload = multer(uploadConfig);

// Motoboy
routes.post("/motoboy/signin", MotoboyController.signin);
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
routes.post(
  "/motoboy/updateprofile",
  googleCloudUpload.single("file"),
  MotoboyController.updateProfile
);
routes.post(
  "/motoboy/updatecnh",
  googleCloudUpload.single("file"),
  MotoboyController.updateCNH
);
routes.post(
  "/motoboy/updatecriminalreport",
  googleCloudUpload.single("file"),
  MotoboyController.updateCriminalRecord
);
routes.post(
  "/motoboy/getprofilestatus",
  verifyJWT,
  MotoboyController.getProfileStatus
);
routes.post(
  "/motoboy/updatebasicinformations",
  verifyJWT,
  MotoboyController.updateBasicInformations
);

// Passenger
routes.post("/passenger/signin", upload.single("file"), PassengerController.signin);
routes.post("/passenger/races", verifyJWT, PassengerController.getRaces);
routes.post("/passenger/user", PassengerController.getUser);
routes.post(
  "/passenger/subscribeToNotifications",
  verifyJWT,
  PassengerController.setFirebaseNotificationToken
);
routes.post(
  "/passenger/updateprofile",
  googleCloudUpload.single("file"),
  PassengerController.updateProfile
);

// Routes
routes.post("/race/create", verifyJWT, RaceController.create);
routes.post("/race/gotopassenger", verifyJWT, RaceController.goToPassenger);
routes.post("/race/startRace", verifyJWT, RaceController.startRace);
routes.post("/race/finishRace", verifyJWT, RaceController.finishRace);
routes.post("/race/remove", verifyJWT, RaceController.removeRace);
routes.post("/race/cancel", verifyJWT, RaceController.cancelRace);

module.exports = routes;
