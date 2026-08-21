const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userName: { type: String, required: true },
  number: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    enum: ["admin", "superadmin"],
    default: "admin",
    lowercase: true,
  },
  isApproved: { type: Boolean, default: false },
  bio: { type: String, default: "" },
  verified: { type: Boolean, default: false },
  token: { type: String },
  otp: { type: Number },
  otpExpiry: { type: Date },
  profileImage: { type: String, default: "" },
});

const staffModel = mongoose.model("staff", staffSchema);
module.exports = staffModel;
