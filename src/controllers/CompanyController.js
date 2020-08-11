var jwt = require("jsonwebtoken");
const path = require("path");
const { format } = require("util");
const { Storage } = require("@google-cloud/storage");
const serviceKey = path.join(__dirname, "..", "..", "storageKey.json");
const storage = new Storage({
  keyFilename: serviceKey,
  projectId: "sudden-279202",
});
const bucket = storage.bucket("sudden_profile_photos");

const Company = require("./../models/Company");
const Race = require("../models/Race");

module.exports = {
  async signin(request, response) {
    const { name, phoneNumber, googleUID } = request.body;

    try {
      const company = await Company.create({
        googleUID,
        name,
        phoneNumber,
        firebaseNotificationToken: "",
      });

      const _id = company._id;

      const token = jwt.sign({ _id }, "@SUDDEN#1012platform");

      const formattedCompany = { ...company._doc };
      formattedCompany.token = token;

      return response.json(formattedCompany);
    } catch (err) {
      if (err.code === 11000) {
        await Company.updateOne({ phoneNumber, googleUID }, { name });
        const company = await Company.findOne({ phoneNumber, googleUID });

        if (company !== null) {
          const _id = company._id;

          const token = jwt.sign({ _id }, "@SUDDEN#1012platform");

          const formattedCompany = { ...company._doc };
          formattedCompany.token = token;

          return response.json(formattedCompany);
        }
        // User unauthorized
        else return response.status(401).json("User authenticated");
      }

      return response.status(500).json("Internal server error");
    }
  },

  async setFirebaseNotificationToken(request, response) {
    const { firebaseNotificationToken, _id } = request.body;

    try {
      const company = await Company.updateOne(
        { _id },
        { firebaseNotificationToken }
      );
      return response.json(firebaseNotificationToken);
    } catch (err) {
      return response.status(500);
    }
  },

  async getUser(request, response) {
    const { phoneNumber, googleUID } = request.body;

    try {
      const user = await Company.findOne({
        phoneNumber,
        googleUID,
      });

      return response.json(user);
    } catch (err) {
      return response.status(500);
    }
  },

  async getRaces(request, response) {
    const { company } = request.body;

    try {
      const myRacesInProgress = await Race.find({
        $or: [
          {
            company,
            status: "inProgress",
          },
          {
            company,
            status: "goToCompany",
          },
        ],
      })
        .populate("company")
        .populate("motoboy");

      const myRacesAwaiting = await Race.find({
        company,
        status: "awaiting",
      })
        .populate("company")
        .populate("motoboy");

      return response.json({
        inProgress: myRacesInProgress || [],
        awaiting: myRacesAwaiting || [],
      });
    } catch (err) {
      return response.status(500);
    }
  },

  async updateProfile(request, response) {
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
        await Company.updateOne(
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
};
