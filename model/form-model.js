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
    unique: true,
  },
  googleSub: {
    type: String,
    required: false,
    default: null,
    sparse: true,
    unique: true,
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      default: [0, 0],
    },
  },

  role: {
    type: String,
    enum: ["rider", "driver"],
    default: "rider",
    lowercase: true,
  },

  rating: {
    type: String,
    default: "0",
    required: function () {
      return this.role === "driver";
    },
  },
  verified: { type: Boolean, default: false },
  token: { type: String },
  otp: { type: Number },
  otpExpiry: { type: Date },
  bio: { type: String, default: "" },
  profileImage: {
    type: String,
    default:
      "https://i.pinimg.com/736x/7d/5b/9e/7d5b9e5839457ea1124bb3c0952c8a84.jpg",
  },
  banned: {
    type: Boolean,
    default: false,
  },
  suspended: {
    type: Boolean,
    default: false,
  },
  assignTimeOut: {
    type: Number,
    required: function () {
      return this.role === "rider";
    },
    default: 10,
  },
  changeEmail: {
    type: String,
    required: false,
  },
  changeNumber: {
    type: String,
    required: false,
  },
  acceptTimeOut: {
    type: Number,
    required: function () {
      return this.role === "rider";
    },
    default: 10,
  },

  //

  age: {
    type: Number,
    required: function () {
      return this.role === "driver";
    },
  },
  isActive: {
    type: Boolean,
    required: function () {
      return this.role === "driver";
    },
  },
  plateNumber: {
    type: String,
    required: function () {
      return this.role === "driver";
    },
  },
  drivingLicense: {
    type: String,
    required: function () {
      return this.role === "driver";
    },
  },
  carBrand: {
    type: String,
    required: function () {
      return this.role === "driver";
    },
  },
  carModel: {
    type: String,
    required: function () {
      return this.role === "driver";
    },
  },
  carYear: {
    type: String,
    required: function () {
      return this.role === "driver";
    },
  },
  carImage: {
    type: Array,
    required: function () {
      return this.role === "driver";
    },
  },
});
const usermodel = mongoose.model("user", userSchema);
module.exports = usermodel;
