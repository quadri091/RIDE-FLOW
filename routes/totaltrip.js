const express = require("express");
const totalTripRouter = express.Router();
const authMiddleWare = require("../middleware/auth.js");
const roleMiddleware = require("../middleware/role.js");
const { deleteTrip, getAll } = require("../controller/totaltrip.js");

totalTripRouter.delete(
  "/delete-trip/:matchCode",
  authMiddleWare,
  roleMiddleware("superadmin"),
  deleteTrip,
);
totalTripRouter.get(
  "/all-trips",
  authMiddleWare,
  roleMiddleware("admin", "superadmin"),
  getAll,
);

module.exports = totalTripRouter;
