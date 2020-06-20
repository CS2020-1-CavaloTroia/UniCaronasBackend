const Company = require("./../models/Company");

module.exports = {
  async showAll(request, response) {
    const company = await Company.find();

    return response.json(company);
  },

  async create(request, response) {
    const thumbnail = request.file.filename;
    const { name, phoneNumber } = request.body;

    const company = await Company.create({
      thumbnail,
      name,
      phoneNumber,
      firebaseNotificationToken: "",
    });

    return response.json(company);
  },
};
