const Race = require("./../models/Race");
const Motoboy = require("./../models/Motoboy");
const firebaseNotification = require("../services/firebaseNotification");
const maps = require("../services/maps");
const MotoboyController = require("./MotoboyController");
const Passenger = require("../models/Passenger");

module.exports = {
  async create(request, response) {
    const {
      passenger,
      initialLocation,
      finalLocation,
      route,
      initiated_at,
      address,
      distance,
      duration,
    } = request.body;

    try {
      const _passenger = await Passenger.findOne({ _id: passenger });

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
          `${_passenger.name} solicitou uma nova entrega para ${address.street}${
            address.number ? `, ${address.number}` : ``
          }`,
          [motoboyCloser.motoboy.firebaseNotificationToken],
          { code: 7001 }
        );

      const race = await Race.create({
        passenger,
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

  async goToPassenger(request, response) {
    const { motoboy, raceId } = request.body;

    try {
      const race = await Race.updateOne(
        { _id: raceId, status: "awaiting" },
        { motoboy, status: "goToPassenger" }
      );

      await Motoboy.update({ _id: motoboy }, { status: "delivering" });

      const _raceModified = await Race.findOne({ _id: raceId })
        .populate("passenger")
        .populate("motoboy");

      if (_raceModified.passenger.firebaseNotificationToken !== "")
        await firebaseNotification.sendNotification(
          "Carona iniciada",
          `${_raceModified.motoboy.name} está vindo até você.`,
          [_raceModified.passenger.firebaseNotificationToken],
          { code: 8001 }
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
        { _id: raceId, motoboy, status: "goToPassenger" },
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
        .populate("passenger")
        .populate("motoboy");

      const race = await Race.updateOne(
        { _id: raceId, motoboy, status: "inProgress" },
        { status: "finished" }
      );

      await Motoboy.updateOne({ _id: motoboy }, { status: "free" });

      if (_raceModified.passenger.firebaseNotificationToken !== "")
        await firebaseNotification.sendNotification(
          "Entrega concluída",
          `${_raceModified.motoboy.name} finalizou a entrega para ${
            _raceModified.address.street
          }${
            _raceModified.address.number
              ? `, ${_raceModified.address.number}`
              : ``
          }.`,
          [_raceModified.passenger.firebaseNotificationToken],
          { code: 8003 }
        );

      return response.status(200).json({ modified: true });
    } catch (err) {
      return response.status(500);
    }
  },

  async removeRace(request, response) {
    const { passenger, raceId } = request.body;

    try {
      const race = await Race.deleteOne({
        _id: raceId,
        passenger,
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
        .populate("passenger")
        .populate("motoboy");

      const race = await Race.updateOne(
        {
          _id: raceId,
          motoboy,
          status: "goToPassenger",
        },
        { status: "awaiting", motoboy: null }
      );

      await Motoboy.updateOne({ _id: motoboy }, { status: "free" });

      if (_raceModified.passenger.firebaseNotificationToken !== "")
        await firebaseNotification.sendNotification(
          "Entrega cancelada",
          `${_raceModified.motoboy.name} cancelou a entrega para ${
            _raceModified.address.street
          }${
            _raceModified.address.number
              ? `, ${_raceModified.address.number}`
              : ``
          }. Estamos buscando outro motoboy para você. ;)`,
          [_raceModified.passenger.firebaseNotificationToken],
          { code: 7002 }
        );

      return response.status(200).json({ modified: true });
    } catch (err) {
      return response.status(500);
    }
  },

  async getInProgressRaces() {
    try {
      const races = await Race.find({ status: "inProgress" })
        .populate("passenger")
        .populate("motoboy");
      return races;
    } catch (err) {
      return [];
    }
  },

  async getAwaitingRaces() {
    try {
      const races = await Race.find({ status: "awaiting" }).populate("passenger");
      return races;
    } catch (err) {
      return [];
    }
  },

  async resendNotificationForAwaintingRaces(
    value,
    _passenger,
    address,
    lastToken
  ) {
    try {
      const race = await Race.updateOne({ _id: value._id }, { sentTo: "all" });

      const motoboys = await MotoboyController.getConnectedMotoboys();

      const tokens = () => {
        const t = [];
        for (let i = 0; i < motoboys.length; i++)
          if (
            motoboys[i].status === "free" &&
            motoboys[i].firebaseNotificationToken !== value.sentTo
          )
            t.push(motoboys[i].firebaseNotificationToken);

        return t;
      };

      await firebaseNotification.sendNotification(
        `Nova carona`,
        `${value.passenger.name} solicitou uma nova carona para ${
          value.address.street
        }${value.address.number ? `, ${value.address.number}` : ``}`,
        tokens(),
        { code: 7001 }
      );
    } catch (err) {
      return [];
    }
  },
};
