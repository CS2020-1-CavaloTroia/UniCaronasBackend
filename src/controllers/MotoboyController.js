const Motoboy = require("./../models/Motoboy");
const { update } = require("./../models/Motoboy");

module.exports = {
  async create(request, response) {
    const thumbnail = request.file.filename;
    const { name, phoneNumber } = request.body;

    try {
      const motoboy = await Motoboy.create({
        thumbnail,
        name,
        phoneNumber,
      });

      return response.json(motoboy);
    } catch (err) {
      if (err.code === 11000)
        return response.status(404).send("User already exists!");

      return response.json(err);
    }
  },

  async updateLocation(request, response) {
    const { _id, latitude, longitude, heading } = request.body;

    try {
      const motoboy = await Motoboy.updateOne(
        { _id },
        { latitude, longitude, heading, online: true }
      );
      return response.json(motoboy);
    } catch (err) {
      return response.status(500);
    }
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
};
