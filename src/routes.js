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

const DriverController = require("./controllers/DriverController");
const PassengerController = require("./controllers/PassengerController");
const RaceController = require("./controllers/RaceController");
const { Router } = require("express");

const routes = express.Router();

const upload = multer(uploadConfig);

// Driver
//Cadastro
routes.post("/driver/signin", DriverController.signin);

//Atualizar Localização
routes.post(
  "/driver/updatelocation",
  verifyJWT,
  DriverController.updateLocation
);

// Coloca o motorista como online
routes.post(
  "/Driver/setconnection",
  verifyJWT,
  DriverController.setDriverConnection
);

// Buscar motoristas online
routes.get(
  "/driver/connected",
  verifyJWT,
  DriverController.getOnlineDrivers
);

// Permitir notificações
routes.post(
  "/driver/subscribeToNotifications",
  verifyJWT,
  DriverController.setFirebaseNotificationToken
);

// Retorna Corridas
routes.post("/driver/races", verifyJWT, DriverController.getRaces);

// Retorna Usuário
routes.post("/driver/user", DriverController.getUser);

// Atualizar o Profile
routes.post(
  "/driver/updateprofile",
  googleCloudUpload.single("file"),
  DriverController.updateProfile
);

// Atualiza CNH
routes.post(
  "/driver/updatecnh",
  googleCloudUpload.single("file"),
  DriverController.updateCNH
);

// Retorna o status do profile
routes.post(
  "/driver/getprofilestatus",
  verifyJWT,
  DriverController.getProfileStatus
);

// Atualiza dados do veículo
routes.post(
  "/driver/updatevehicleinformations",
  verifyJWT,
  DriverController.updateVehicleInformations
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
