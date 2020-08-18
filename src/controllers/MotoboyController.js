var jwt = require("jsonwebtoken");
const path = require("path");
const { format } = require("util");
const { Storage } = require("@google-cloud/storage");

const Motoboy = require("./../models/Motoboy");
const Race = require("./../models/Race");

module.exports = {
  async signin(request, response) {
    // const thumbnail = request.file.filename;
    const { name, phoneNumber, googleUID, cpf } = request.body;
    const lastTimeOnline = new Date();

    try {
      const motoboy = await Motoboy.create({
        googleUID,
        name,
        phoneNumber,
        firebaseNotificationToken: "",
        online: false,
        status: "free",
        lastTimeOnline: lastTimeOnline.getTime(),
        profileStatus: "analysing",
        cpf,
      });

      const _id = motoboy._id;

      const token = jwt.sign({ _id }, "@SUDDEN#1012platform");

      const formattedMotoboy = { ...motoboy._doc };
      formattedMotoboy.token = token;

      return response.json(formattedMotoboy);
    } catch (err) {
      if (err.code === 11000) {
        await Motoboy.updateOne(
          { phoneNumber, googleUID },
          { name, online: false, status: "free", cpf }
        );
        const motoboy = await Motoboy.findOne({ phoneNumber, googleUID });

        if (motoboy !== null) {
          const _id = motoboy._id;

          const token = jwt.sign({ _id }, "@SUDDEN#1012platform");

          const formattedMotoboy = { ...motoboy._doc };
          formattedMotoboy.token = token;

          return response.json(formattedMotoboy);
        }
        // User unauthorized
        else return response.status(401).json("User authenticated");
      }

      return response.status(500).json("Internal server error");
    }
  },

  async getUser(request, response) {
    const { phoneNumber, googleUID } = request.body;

    try {
      const user = await Motoboy.findOne({
        phoneNumber,
        googleUID,
      });

      return response.json(user);
    } catch (err) {
      return response.status(500);
    }
  },

  async setFirebaseNotificationToken(request, response) {
    const { firebaseNotificationToken, _id } = request.body;

    try {
      const motoboy = await Motoboy.updateOne(
        { _id },
        { firebaseNotificationToken }
      );
      return response.json(firebaseNotificationToken);
    } catch (err) {
      return response.status(500);
    }
  },

  async updateLocation(request, response) {
    const { _id, latitude, longitude, heading, speed } = request.body[0];
    const lastTimeOnline = new Date();

    // if (speed > 2)
    try {
      const motoboy = await Motoboy.updateOne(
        { _id },
        {
          latitude,
          longitude,
          heading,
          online: true,
          lastTimeOnline: lastTimeOnline.getTime(),
        }
      );
      return response.json(motoboy);
    } catch (err) {
      return response.status(500);
    }

    // return response.status(200);
  },

  async setMotoboyConnection(request, response) {
    const { _id, online } = request.body;

    try {
      const motoboy = await Motoboy.updateOne({ _id }, { online });
      return response.json(motoboy);
    } catch (err) {
      return response.status(500);
    }
  },

  async getOnlineMotoboys(request, response) {
    try {
      const connectedMotoboys = await Motoboy.find({ online: true });
      return response.json(connectedMotoboys);
    } catch (err) {
      return response.status(500);
    }
  },

  async setToOffline(_id) {
    try {
      await Motoboy.updateOne({ _id }, { online: false });
    } catch (err) {}
  },

  async getRaces(request, response) {
    const { motoboy } = request.body;

    try {
      const pendingRaces = await Race.find({ status: "awaiting" }).populate(
        "company"
      );
      const myRace = await Race.find({
        $or: [
          {
            status: "inProgress",
            motoboy,
          },
          {
            status: "goToCompany",
            motoboy,
          },
        ],
      })
        .populate("company")
        .populate("motoboy");

      return response.json({
        awaiting: pendingRaces || [],
        inProgress: myRace,
      });
    } catch (err) {
      return response.status(500);
    }
  },

  async getConnectedMotoboys() {
    try {
      const motoboys = await Motoboy.find({ online: true });
      return motoboys;
    } catch (err) {
      return [];
    }
  },

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
        await Motoboy.updateOne(
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
        await Motoboy.updateOne(
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

  async updateCriminalRecord(request, response) {
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
        await Motoboy.updateOne(
          { _id: request.body._id },
          { criminalRecord: publicUrl }
        );
        response.status(200).send(publicUrl);
      } catch (err) {
        response.status(500);
      }
    });

    blobStream.end(request.file.buffer);
  },
};
