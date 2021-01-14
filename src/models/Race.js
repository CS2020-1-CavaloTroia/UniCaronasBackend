const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RaceSchema = Schema({
  company: { type: Schema.Types.ObjectId, ref: "Company" },
  motoboy: { type: Schema.Types.ObjectId, ref: "Driver" },
  initialLocation: Object,
  finalLocation: Object,
  address: Object,
  route: Array,
  distance: String,
  duration: String,
  status: String, // "awaiting" "goToCompany" "inProgress" "finished" "cancelByMotoboy" "cancelByCompany" "cancelByClient"
  initiated_at: Number,
  finished_at: Number,
  sentTo: String, // Motoboy token with unique access to the race. Max duration = 14 seconds else it is sent to all motoboys ["{token}", "all"]
});

module.exports = mongoose.model("Race", RaceSchema);
