const mongoose = require("mongoose");
const urls = require("./../config/urls");

const CompanySchema = new mongoose.Schema(
  {
    thumbnail: String,
    googleUID: String,
    name: String,
    phoneNumber: { type: String, unique: true, index: true, required: true },
    address: Object,
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

  return `localhost:3333/files/${this.thumbnail}`;
});

module.exports = mongoose.model("Company", CompanySchema);
