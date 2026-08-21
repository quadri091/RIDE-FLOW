const mongoose = require("mongoose");

const bannedSchema = new mongoose.Schema({
  user: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      unique: true,
    },
    email: { type: String, required: true },
    userName: { type: String, required: true },
    role: { type: String, enum: ["rider", "driver"], required: true },
  },

  reason: { type: String, required: true },

  relatedDispute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "dispute",
    default: null,
  },

  bannedBy: {
    id: { type: mongoose.Schema.Types.ObjectId, required: true }, // superadmin id
    name: { type: String, required: true },
  },

  bannedAt: {
    type: Date,
    default: Date.now,
  },
});

const bannedModel = mongoose.model("banned", bannedSchema);
module.exports = bannedModel;
