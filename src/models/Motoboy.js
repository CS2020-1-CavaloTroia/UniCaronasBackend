const mongoose = require("mongoose");
const urls = require("./../config/urls");

const MotoboySchema = new mongoose.Schema(
  {
    thumbnail: String,
    name: String,
    phoneNumber: { type: String, unique: true, index: true, required: true },
    online: Boolean,
    latitude: Number,
    longitude: Number,
  },
  {
    toJSON: {
      virtuals: true,
    },
  }
);

MotoboySchema.virtual("thumbnail_url").get(function () {
  return `localhost:3333/files/${this.thumbnail}`;
});

module.exports = mongoose.model("Motoboy", MotoboySchema);
