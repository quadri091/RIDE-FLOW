const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: {
    type: String,
    required: function () {
      return !this.googleSub;
    },
  },
  userName: { type: String, required: true },
  number: {
    type: String,
    required: function () {
      return !this.googleSub;
    },
  },
  googleSub: {
    type: String,
    required: false,
    default: null,
    sparse: true,
    unique: true,
  },
  verified: { type: Boolean, default: false },
  token: { type: String },
  otp: { type: Number },
  otpExpiry: { type: Date },
  bio: { type: String, default: "" },
  profileImage: { type: String, default: "" },

  //
  plateNumber: { type: String, required: false },
  carBrand: { type: String, required: false },
  carModel: { type: String, required: false },
  carYear: { type: String, required: false },
  carImage: { type: Array, required: false },
});
const usermodel = mongoose.model("user", userSchema);
module.exports = usermodel;
