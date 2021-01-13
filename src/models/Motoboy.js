const mongoose = require("mongoose");
const { baseURL } = require("../config/urls");
const { Double } = require("mongodb");

const DriverSchema = new mongoose.Schema(
  {
    thumbnail: String, //Foto do usuário
    googleUID: String, // ID do Google
    name: String, // Nome do usuário
    phoneNumber: { type: String, unique: true, index: true, required: true }, // Número de telefone do motorista
    online: Boolean, // Representa se o motorista está online ou não
    status: String, // Representa se o motorista está em viagem ou está livre: 'driving' 'free'
    latitude: Number, // Latitude da posição atual do motorista
    longitude: Number, // Longitude da posição atual do motorista
    heading: Number, // Direção em graus da localização atual
    lastTimeOnline: Number,
    firebaseNotificationToken: String, // Token de notificação do firebase
    CNHDocument: String, // Número da CNH do motorista
    profileImage: String,
    profileStatus: String, //analysing, free, block, awaitingPayment
    rating: Number,
    ratings: Object,
    supportMessage: String,
    nextPayment: Number,
    paymentValue: Number,
    vehicleBoard: String,
    vehicleModel: String, // Modelo do veículo
    vehicleColor: String, // Cor do veículo
  },
  {
    toJSON: {
      virtuals: true,
    },
  }
);

MotoboySchema.virtual("thumbnail_url").get(function () {
  if (this.thumbnail === undefined) return null;

  return `${baseURL}/files/${this.thumbnail}`;
});

module.exports = mongoose.model("Motoboy", MotoboySchema);
