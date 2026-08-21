const mongoose = require("mongoose");

const suspendedSchema = new mongoose.Schema({
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

  suspendedBy: {
    id: { type: mongoose.Schema.Types.ObjectId, required: true }, // admin or superadmin id
    name: { type: String, required: true },
  },

  suspendedAt: {
    type: Date,
    default: Date.now,
  },

  suspendedUntil: {
    type: Date,
    required: true, // suspensions should always have an end date, unlike bans
  },
});

const suspendedModel = mongoose.model("suspended", suspendedSchema);
module.exports = suspendedModel;
