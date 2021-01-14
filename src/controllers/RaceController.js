const Race = require("./../models/Race");
const Driver = require("./../models/Driver");
const firebaseNotification = require("../services/firebaseNotification");
const maps = require("../services/maps");
const DriverController = require("./DriverController");
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

      const driver = await DriverController.getConnecteddriver();

      let driverCloser = {
        driver: null,
        distance: 0,
      };

      // const tokens = () => {
      //   const t = [];
      //   for (let i = 0; i < driver.length; i++)
      //     if (driver[i].status === "free")
      //       t.push(driver[i].firebaseNotificationToken);

      //   return t;
      // };

      for (let i = 0; i < driver.length; i++)
        if (driver[i].status === "free") {
          const distance = maps.distanceBetween2Coords(initialLocation, {
            latitude: driver[i].latitude,
            longitude: driver[i].longitude,
          });

          if (!driverCloser.driver || driverCloser.distance > distance) {
            driverCloser.driver = driver[i];
            driverCloser.distance = distance;
          }
        }

      if (driverCloser.driver)
        await firebaseNotification.sendNotification(
          `${driverCloser.driver.name},`,
          `${_company.name} solicitou uma nova entrega para ${address.street}${
            address.number ? `, ${address.number}` : ``
          }`,
          [driverCloser.driver.firebaseNotificationToken],
          { code: 7001 }
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
        sentTo: driverCloser.driver
          ? driverCloser.driver.firebaseNotificationToken
          : "all",
      });

      return response.json(race);
    } catch (err) {
      return response.status(500);
    }
  },

  async goToCompanyRace(request, response) {
    const { driver, raceId } = request.body;

    try {
      const race = await Race.updateOne(
        { _id: raceId, status: "awaiting" },
        { driver, status: "goToCompany" }
      );

      await DriverController.update({ _id: driver }, { status: "delivering" });

      const _raceModified = await Race.findOne({ _id: raceId })
        .populate("company")
        .populate("driver");

      if (_raceModified.company.firebaseNotificationToken !== "")
        await firebaseNotification.sendNotification(
          "Entrega iniciada",
          `${_raceModified.driver.name} está vindo até você.`,
          [_raceModified.company.firebaseNotificationToken],
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
    const { driver, raceId } = request.body;

    try {
      const race = await Race.updateOne(
        { _id: raceId, driver, status: "goToCompany" },
        { status: "inProgress" }
      );

      return response.status(200).json({ modified: true });
    } catch (err) {
      return response.status(500);
    }
  },

  async finishRace(request, response) {
    const { driver, raceId } = request.body;

    try {
      const _raceModified = await Race.findOne({ _id: raceId })
        .populate("company")
        .populate("driver");

      const race = await Race.updateOne(
        { _id: raceId, driver, status: "inProgress" },
        { status: "finished" }
      );

      await Driver.updateOne({ _id: driver }, { status: "free" });

      if (_raceModified.company.firebaseNotificationToken !== "")
        await firebaseNotification.sendNotification(
          "Entrega concluída",
          `${_raceModified.driver.name} finalizou a entrega para ${
            _raceModified.address.street
          }${
            _raceModified.address.number
              ? `, ${_raceModified.address.number}`
              : ``
          }.`,
          [_raceModified.company.firebaseNotificationToken],
          { code: 8003 }
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
    const { driver, raceId } = request.body;

    try {
      const _raceModified = await Race.findOne({ _id: raceId })
        .populate("company")
        .populate("driver");

      const race = await Race.updateOne(
        {
          _id: raceId,
          driver,
          status: "goToCompany",
        },
        { status: "awaiting", driver: null }
      );

      await Driver.updateOne({ _id: driver }, { status: "free" });

      if (_raceModified.company.firebaseNotificationToken !== "")
        await firebaseNotification.sendNotification(
          "Entrega cancelada",
          `${_raceModified.driver.name} cancelou a entrega para ${
            _raceModified.address.street
          }${
            _raceModified.address.number
              ? `, ${_raceModified.address.number}`
              : ``
          }. Estamos buscando outro motorista para você. ;)`,
          [_raceModified.company.firebaseNotificationToken],
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
        .populate("company")
        .populate("driver");
      return races;
    } catch (err) {
      return [];
    }
  },

  async getAwaitingRaces() {
    try {
      const races = await Race.find({ status: "awaiting" }).populate("company");
      return races;
    } catch (err) {
      return [];
    }
  },

  async resendNotificationForAwaintingRaces(
    value,
    _company,
    address,
    lastToken
  ) {
    try {
      const race = await Race.updateOne({ _id: value._id }, { sentTo: "all" });

      const driver = await DriverController.getConnectedDriver();

      const tokens = () => {
        const t = [];
        for (let i = 0; i < driver.length; i++)
          if (
            driver[i].status === "free" &&
            driver[i].firebaseNotificationToken !== value.sentTo
          )
            t.push(driver[i].firebaseNotificationToken);

        return t;
      };

      await firebaseNotification.sendNotification(
        `Nova corrida`,
        `${value.company.name} solicitou uma nova entrega para ${
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
