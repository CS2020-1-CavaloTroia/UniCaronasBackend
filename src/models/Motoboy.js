const mongoose = require("mongoose");

const MotoboySchema = new mongoose.Schema(
  {
    thumbnail: String,
    googleUID: String,
    name: String,
    phoneNumber: { type: String, unique: true, index: true, required: true },
    online: Boolean,
    latitude: Number,
    longitude: Number,
    heading: Number,
    firebaseNotificationToken: String,
  },
  {
    toJSON: {
      virtuals: true,
    },
  }
);

MotoboySchema.virtual("thumbnail_url").get(function () {
  if (this.thumbnail === undefined) return null;

  return `localhost:3333/files/${this.thumbnail}`;
});

module.exports = mongoose.model("Motoboy", MotoboySchema);
