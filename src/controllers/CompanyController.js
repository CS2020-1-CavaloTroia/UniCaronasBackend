var jwt = require("jsonwebtoken");
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
        company,
        status: "inProgress",
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
};
