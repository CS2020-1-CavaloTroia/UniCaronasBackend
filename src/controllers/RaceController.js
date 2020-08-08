const Race = require("./../models/Race");
const Motoboy = require("./../models/Motoboy");
const firebaseNotification = require("../services/firebaseNotification");
const maps = require("../services/maps");
const MotoboyController = require("./MotoboyController");
const Company = require("../models/Company");

module.exports = {
  async create(request, response) {
    const {
      company,
      initialLocation,
      finalLocation,
      route,
      initiated_at,
      address,
      distance,
      duration,
    } = request.body;

    try {
      const _company = await Company.findOne({ _id: company });

      const motoboys = await MotoboyController.getConnectedMotoboys();

      let motoboyCloser = {
        motoboy: null,
        distance: 0,
      };

      // const tokens = () => {
      //   const t = [];
      //   for (let i = 0; i < motoboys.length; i++)
      //     if (motoboys[i].status === "free")
      //       t.push(motoboys[i].firebaseNotificationToken);

      //   return t;
      // };

      for (let i = 0; i < motoboys.length; i++)
        if (motoboys[i].status === "free") {
          const distance = maps.distanceBetween2Coords(initialLocation, {
            latitude: motoboys[i].latitude,
            longitude: motoboys[i].longitude,
          });

          if (!motoboyCloser.motoboy || motoboyCloser.distance > distance) {
            motoboyCloser.motoboy = motoboys[i];
            motoboyCloser.distance = distance;
          }
        }

      if (motoboyCloser.motoboy)
        await firebaseNotification.sendNotification(
          `${motoboyCloser.motoboy.name},`,
          `${_company.name} solicitou uma nova entrega para ${address.street}${
            address.number ? `, ${address.number}` : ``
          }`,
          [motoboyCloser.motoboy.firebaseNotificationToken],
          7001
        );

      const race = await Race.create({
        company,
        initialLocation,
        finalLocation,
        route,
        distance,
        duration,
        status: "awaiting",
        initiated_at,
        address,
        sentTo: motoboyCloser.motoboy
          ? motoboyCloser.motoboy.firebaseNotificationToken
          : "all",
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

      await Motoboy.update({ _id: motoboy }, { status: "delivering" });

      const _raceModified = await Race.findOne({ _id: raceId })
        .populate("company")
        .populate("motoboy");

      if (_raceModified.company.firebaseNotificationToken !== "")
        await firebaseNotification.sendNotification(
          "Entrega iniciada",
          `${_raceModified.motoboy.name} está vindo até você.`,
          [_raceModified.company.firebaseNotificationToken],
          8001
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
      const _raceModified = await Race.findOne({ _id: raceId })
        .populate("company")
        .populate("motoboy");

      const race = await Race.updateOne(
        { _id: raceId, motoboy, status: "inProgress" },
        { status: "finished" }
      );

      await Motoboy.updateOne({ _id: motoboy }, { status: "free" });

      if (_raceModified.company.firebaseNotificationToken !== "")
        await firebaseNotification.sendNotification(
          "Entrega concluída",
          `${_raceModified.motoboy.name} finalizou a entrega para ${
            _raceModified.address.street
          }${
            _raceModified.address.number
              ? `, ${_raceModified.address.number}`
              : ``
          }.`,
          [_raceModified.company.firebaseNotificationToken],
          8003
        );

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
      const _raceModified = await Race.findOne({ _id: raceId })
        .populate("company")
        .populate("motoboy");

      const race = await Race.updateOne(
        {
          _id: raceId,
          motoboy,
          status: "goToCompany",
        },
        { status: "awaiting", motoboy: null }
      );

      await Motoboy.updateOne({ _id: motoboy }, { status: "free" });

      if (_raceModified.company.firebaseNotificationToken !== "")
        await firebaseNotification.sendNotification(
          "Entrega cancelada",
          `${_raceModified.motoboy.name} cancelou a entrega para ${
            _raceModified.address.street
          }${
            _raceModified.address.number
              ? `, ${_raceModified.address.number}`
              : ``
          }. Estamos buscando outro motoboy para você. ;)`,
          [_raceModified.company.firebaseNotificationToken],
          8002
        );

      return response.status(200).json({ modified: true });
    } catch (err) {
      return response.status(500);
    }
  },
};
