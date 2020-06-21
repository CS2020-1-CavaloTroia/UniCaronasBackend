const Races = require("./../models/Race");

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
      const race = await Races.create({
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
};
