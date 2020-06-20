const mongoose = require("mongoose");
const urls = require("./../config/urls");

var Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

const RaceSchema = new mongoose.Schema({
  clientId: ObjectId,
  companyId: ObjectId,
  motoboyID: ObjectId,
  initialLocation: Object,
  finalLocation: Object,
  status: String,
});

module.exports = mongoose.model("Race", RaceSchema);
