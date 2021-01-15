var jwt = require("jsonwebtoken");
const path = require("path");
const { format } = require("util");
const { Storage } = require("@google-cloud/storage");

const Driver = require("./../models/Driver");
const Race = require("./../models/Race");

module.exports = {
  // Cadastra o motorista
  async signin(request, response) {
    // const thumbnail = request.file.filename;
    const { name, phoneNumber, googleUID } = request.body;
    const lastTimeOnline = new Date();

    try {
      const driver = await Driver.create({
        googleUID,
        name,
        phoneNumber,
        firebaseNotificationToken: "",
        online: false,
        status: "free",
        lastTimeOnline: lastTimeOnline.getTime(),
        profileStatus: "analysing",
        rating: 0,
        ratings: {},
        vehicleColor: "#D2691E",
      });

      const _id = driver._id;

      const token = jwt.sign({ _id }, "@SUDDEN#1012platform");

      const formattedDriver = { ...driver._doc };
      formattedDriver.token = token;

      if (response === "test") {
        return formattedDriver;
      }

      return response.json(formattedDriver);
    } catch (err) {
      if (err.code === 11000) {
        await Driver.updateOne(
          { phoneNumber, googleUID },
          { name, online: false, status: "free" }
        );
        const driver = await Driver.findOne({ phoneNumber, googleUID });

        if (driver !== null) {
          const _id = driver._id;

          const token = jwt.sign({ _id }, "@SUDDEN#1012platform");

          const formattedDriver = { ...driver._doc };
          formattedDriver.token = token;

          if (response === "test") {
          }
          return response.json(formattedDriver);
        } else return response.status(401).json("User authenticated");
      }

      return response.status(500).json("Internal server error");
    }
  },

  // Retorna os dados do motorista
  async getUser(request, response) {
    const { phoneNumber, googleUID } = request.body;

    try {
      const user = await Driver.findOne({
        phoneNumber,
        googleUID,
      });

      if (response === "test") {
        return user;
      }

      return response.json(user);
    } catch (err) {
      return response.status(500);
    }
  },

  // Atribui o token de notificação do Firebase
  async setFirebaseNotificationToken(request, response) {
    const { firebaseNotificationToken, _id } = request.body;

    try {
      const driver = await Driver.updateOne(
        { _id },
        { firebaseNotificationToken }
      );
      return response.json(firebaseNotificationToken);
    } catch (err) {
      return response.status(500);
    }
  },

  // Atualiza a localização do motorista
  async updateLocation(request, response) {
    const { _id, latitude, longitude, heading, speed } = request.body[0];
    const lastTimeOnline = new Date();

    // if (speed > 2)
    try {
      const driver = await Driver.updateOne(
        { _id },
        {
          latitude,
          longitude,
          heading,
          online: true,
          lastTimeOnline: lastTimeOnline.getTime(),
        }
      );
      return response.json(driver);
    } catch (err) {
      return response.status(500);
    }

    // return response.status(200);
  },

  // Torna o status do motorista como online
  async setDriverConnection(request, response) {
    const { _id, online } = request.body;

    try {
      const driver = await Driver.updateOne({ _id }, { online });
      return response.json(driver);
    } catch (err) {
      return response.status(500);
    }
  },

  // Retorna os motoristas disponíveis
  async getOnlineDrivers(request, response) {
    try {
      const connectedDrivers = await Driver.find({ online: true });
      return response.json(connectedDrivers);
    } catch (err) {
      return response.status(500);
    }
  },

  // Define o status do motorista como offline
  async setToOffline(_id) {
    try {
      await Driver.updateOne({ _id }, { online: false });
    } catch (err) {}
  },

  // Retorna os dados das corridas
  async getRaces(request, response) {
    const { driver } = request.body;

    try {
      const pendingRaces = await Race.find({ status: "awaiting" }).populate(
        "passenger"
      );
      const myRace = await Race.find({
        $or: [
          {
            status: "inProgress",
            driver,
          },
          {
            status: "goToPassenger",
            driver,
          },
        ],
      })
        .populate("passenger")
        .populate("driver");

      return response.json({
        awaiting: pendingRaces || [],
        inProgress: myRace,
      });
    } catch (err) {
      return response.status(500);
    }
  },

  // Conectar a um motorista online
  async getConnectedDriver() {
    try {
      const driver = await Driver.find({ online: true });
      return driver;
    } catch (err) {
      return [];
    }
  },

  // Retorna todos os motoristas
  async getAllDrivers() {
    try {
      const drivers = await Driver.find();
      return drivers;
    } catch (err) {
      return [];
    }
  },

  // Atualiza o status do perfil
  async updateProfileStatus(_id, profileStatus) {
    try {
      await Driver.updateOne({ _id }, { profileStatus });
    } catch (err) {}
  },

  // Atualiza o perfil do motorista
  async updateProfile(request, response) {
    const serviceKey = path.join(__dirname, "..", "..", "storageKey.json");
    const storage = new Storage({
      keyFilename: serviceKey,
      projectId: "sudden-279202",
    });
    const bucket = storage.bucket("sudden_profile_photos");
    const ext = path.extname(request.file.originalname);
    const name = path.basename(request.file.originalname, ext);
    const blob = bucket.file(`${name}-${Date.now()}${ext}`);
    const blobStream = blob.createWriteStream();

    blobStream.on("error", (err) => {
      next(err);
    });

    blobStream.on("finish", async () => {
      // The public URL can be used to directly access the file via HTTP.
      const publicUrl = format(
        `https://storage.googleapis.com/${bucket.name}/${blob.name}`
      );
      try {
        await Driver.updateOne(
          { _id: request.body._id },
          { thumbnail: publicUrl }
        );
        response.status(200).send(publicUrl);
      } catch (err) {
        response.status(500);
      }
    });

    blobStream.end(request.file.buffer);
  },

  // Atualiza a CNH
  async updateCNH(request, response) {
    const serviceKey = path.join(__dirname, "..", "..", "storageKey.json");
    const storage = new Storage({
      keyFilename: serviceKey,
      projectId: "sudden-279202",
    });
    const bucket = storage.bucket("sudden_profile_photos");
    const ext = path.extname(request.file.originalname);
    const name = path.basename(request.file.originalname, ext);
    const blob = bucket.file(`${name}-${Date.now()}${ext}`);
    const blobStream = blob.createWriteStream();

    blobStream.on("error", (err) => {
      next(err);
    });

    blobStream.on("finish", async () => {
      // The public URL can be used to directly access the file via HTTP.
      const publicUrl = format(
        `https://storage.googleapis.com/${bucket.name}/${blob.name}`
      );
      try {
        await Driver.updateOne(
          { _id: request.body._id },
          { CNHDocument: publicUrl }
        );
        response.status(200).send(publicUrl);
      } catch (err) {
        response.status(500);
      }
    });

    blobStream.end(request.file.buffer);
  },

  // Retorna o status do perfil do motorista
  async getProfileStatus(request, response) {
    const { _id } = request.body;

    try {
      const status = await Driver.findOne({ _id }).select("profileStatus");

      return response.json({
        profileStatus: status.profileStatus,
      });
    } catch (err) {
      return response.status(500);
    }
  },

  // Encontra os motoristas online
  async getConnectedDrivers() {
    try {
      const drivers = await Driver.find({ online: true });
      return drivers;
    } catch (err) {
      return [];
    }
  },

  // Atualiza os dados do veículo do motorista
  async updateVehicleInformations(request, response) {
    const {
      _id,
      name,
      vehicleColor,
      vehicleBoard,
      vehicleModel,
    } = request.body;

    try {
      const update = await Driver.updateOne(
        { _id },
        { name, vehicleColor, vehicleBoard, vehicleModel }
      );

      return response.json({
        name,
        vehicleColor,
        vehicleBoard,
        vehicleModel,
      });
    } catch (err) {
      return response.status(500);
    }
  },
};
