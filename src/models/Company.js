const mongoose = require("mongoose");
const { baseURL } = require("../config/urls");

const CompanySchema = new mongoose.Schema(
  {
    thumbnail: String,
    googleUID: String,
    name: String,
    phoneNumber: { type: String, unique: true, index: true, required: true },
    latitude: Number,
    longitude: Number,
    firebaseNotificationToken: String,
  },
  {
    toJSON: {
      virtuals: true,
    },
  }
);

CompanySchema.virtual("thumbnail_url").get(function () {
  if (this.thumbnail === undefined) return null;

  return `${baseURL}/files/${this.thumbnail}`;
});

module.exports = mongoose.model("Company", CompanySchema);
