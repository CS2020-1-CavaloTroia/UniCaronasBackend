var jwt = require("jsonwebtoken");
const Company = require("./../models/Company");

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
};
