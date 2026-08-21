const express = require("express");
const tripRouter = express.Router();
const authMiddleWare = require("../middleware/auth.js");
const {
  createTrip,
  assignTrip,
  applyTrip,
  acceptTrip,
  declineTrip,
  startTrip,
  endTrip,
  getTrip,
  getActiveTrip,
  getTotalTrip,
  giveRating,
} = require("../controller/trip.js");

tripRouter.post("/create-trip", authMiddleWare, createTrip);
tripRouter.post("/assign-trip", authMiddleWare, assignTrip);
tripRouter.post("/apply-trip", authMiddleWare, applyTrip);
tripRouter.post("/accept-trip", authMiddleWare, acceptTrip);
tripRouter.post("/decline-trip", authMiddleWare, declineTrip);
tripRouter.post("/start-trip", authMiddleWare, startTrip);
tripRouter.post("/end-trip", authMiddleWare, endTrip);
tripRouter.get("/get-trip/:matchCode", authMiddleWare, getTrip);
tripRouter.get("/get-active-trip", authMiddleWare, getActiveTrip);
tripRouter.get("/get-total-trip", authMiddleWare, getTotalTrip);
tripRouter.post("/give-rating", authMiddleWare, giveRating);

module.exports = tripRouter;
