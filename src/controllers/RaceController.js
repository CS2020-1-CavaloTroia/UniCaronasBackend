const Race = require("./../models/Race");
const Motoboy = require("./../models/Motoboy");
const firebaseNotification = require("../services/firebaseNotification");
const MotoboyController = require("./MotoboyController");

module.exports = {
  async create(request, response) {
    const {
      company,
      initialLocation,
      finalLocation,
      route,
      initiated_at,
      address,
    } = request.body;

    try {
      const race = await Race.create({
        company,
        initialLocation,
        finalLocation,
        route,
        status: "awaiting",
        initiated_at,
        address,
      });

      const motoboys = await MotoboyController.getConnectedMotoboys();

      const tokens = () => {
        const t = [];
        motoboys.map((value, index) => {
          t.push(value.firebaseNotificationToken);
        });
        return t;
      };

      await firebaseNotification.sendNotification(
        "Nova entrega solicidada",
        `Sudden Platform solicitou uma nova entrega de 11km para ${address}`,
        tokens,
        525
      );

      return response.json(race);
    } catch (err) {
      return response.status(500);
    }
  },

  async goToCompanyRace(request, response) {
    const { motoboy, raceId } = request.body;

    try {
      const race = await Race.updateOne(
        { _id: raceId, status: "awaiting" },
        { motoboy, status: "goToCompany" }
      );

      await Motoboy.update({ _id: motoboy }, { status: "delivering" });

      if (race.nModified === 1)
        return response.status(200).json({ modified: true });
      else return response.status(304).json({ modified: false });
    } catch (err) {
      return response.status(500);
    }
  },

  async startRace(request, response) {
    const { motoboy, raceId } = request.body;

    try {
      const race = await Race.updateOne(
        { _id: raceId, motoboy, status: "goToCompany" },
        { status: "inProgress" }
      );

      return response.status(200).json({ modified: true });
    } catch (err) {
      return response.status(500);
    }
  },

  async finishRace(request, response) {
    const { motoboy, raceId } = request.body;

    try {
      const race = await Race.updateOne(
        { _id: raceId, motoboy, status: "inProgress" },
        { status: "finished" }
      );

      await Motoboy.update({ _id: motoboy }, { status: "free" });

      return response.status(200).json({ modified: true });
    } catch (err) {
      return response.status(500);
    }
  },

  async removeRace(request, response) {
    const { company, raceId } = request.body;

    try {
      const race = await Race.deleteOne({
        _id: raceId,
        company,
        status: "awaiting",
      });

      return response.status(200).json({ removed: true });
    } catch (err) {
      return response.status(500);
    }
  },

  async cancelRace(request, response) {
    const { motoboy, raceId } = request.body;

    try {
      const race = await Race.updateOne(
        {
          _id: raceId,
          motoboy,
          status: "goToCompany",
        },
        { status: "awaiting", motoboy: null }
      );

      return response.status(200).json({ modified: true });
    } catch (err) {
      return response.status(500);
    }
  },
};
