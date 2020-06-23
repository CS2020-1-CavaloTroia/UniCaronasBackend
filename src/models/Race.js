const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RaceSchema = Schema({
  company: { type: Schema.Types.ObjectId, ref: "Company" },
  motoboy: { type: Schema.Types.ObjectId, ref: "Motoboy" },
  initialLocation: Object,
  finalLocation: Object,
  address: String,
  route: Array,
  status: String, // "awaiting" "inProgress" "finished" "cancelByMotoboy" "cancelByCompany" "cancelByClient"
  initiated_at: Number,
  finished_at: Number,
});

module.exports = mongoose.model("Race", RaceSchema);
