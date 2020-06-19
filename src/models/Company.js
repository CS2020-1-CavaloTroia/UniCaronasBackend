const mongoose = require("mongoose");
const urls = require("./../config/urls");

const CompanySchema = new mongoose.Schema(
  {
    thumbnail: String,
    name: String,
    phoneNumber: { type: String, unique: true, index: true, required: true },
    address: Object,
  },
  {
    toJSON: {
      virtuals: true,
    },
  }
);

CompanySchema.virtual("thumbnail_url").get(function () {
  return `${urls.baseURL}/files/${this.thumbnail}`;
});

module.exports = mongoose.model("Company", CompanySchema);
