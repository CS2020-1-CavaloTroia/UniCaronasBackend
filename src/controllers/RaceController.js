const Race = require("./../models/Race");

module.exports = {
  async create(request, response) {
    const {
      companyId,
      initialLocation,
      finalLocation,
      route,
      initiated_at,
      address,
    } = request.body;

    try {
      const race = await Race.create({
        companyId,
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

  async startRace(request, response) {
    const { motoboyId, raceId } = request.body;

    try {
      const race = await Race.updateOne(
        { _id: raceId, status: "awaiting" },
        { motoboyId, status: "inProgress" }
      );

      if (race.nModified === 1)
        return response.status(200).json({ modified: true });
      else return response.status(304).json({ modified: false });
    } catch (err) {
      return response.status(500);
    }
  },
};
