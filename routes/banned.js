const express = require("express");
const bannedRouter = express.Router();
const authMiddleWare = require("../middleware/auth.js");
const {
  banUser,
  unbanUser,
  getAllBanned,
  getBanByUser,
} = require("../controller/banned.js");
const roleMiddleware = require("../middleware/role.js");

bannedRouter.post(
  "/ban",
  authMiddleWare,
  roleMiddleware("admin", "superadmin"),
  banUser,
);
bannedRouter.delete(
  "/unban",
  authMiddleWare,
  roleMiddleware("admin", "superadmin"),
  unbanUser,
);
bannedRouter.get(
  "/all-banned",
  authMiddleWare,
  roleMiddleware("admin", "superadmin"),
  getAllBanned,
);
bannedRouter.get(
  "/get-banned-by-id/:userId",
  authMiddleWare,
  roleMiddleware("admin", "superadmin"),
  getBanByUser,
);

module.exports = bannedRouter;
