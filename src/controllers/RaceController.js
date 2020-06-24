const Race = require("./../models/Race");

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
        { _id: raceId, status: "goToCompany" },
        { motoboy, status: "inProgress" }
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
        { _id: raceId, status: "inProgress" },
        { motoboy, status: "finished" }
      );

      return response.status(200).json({ modified: true });
    } catch (err) {
      return response.status(500);
    }
  },
};
