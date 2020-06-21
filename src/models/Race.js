const mongoose = require("mongoose");

const RaceSchema = new mongoose.Schema({
  companyId: String,
  motoboyId: String,
  initialLocation: Object,
  finalLocation: Object,
  route: Array,
  status: String, // "awaiting" "inProgress" "finished" "cancelByMotoboy" "cancelByCompany" "cancelByClient"
  initiated_at: Number,
  finished_at: Number,
});

module.exports = mongoose.model("Race", RaceSchema);
