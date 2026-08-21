const express = require("express");
const suspendedRouter = express.Router();
const authMiddleWare = require("../middleware/auth.js");
const {
  suspendUser,
  unsuspendUser,
  getAllSuspended,
  getSuspensionByUser,
} = require("../controller/suspended.js");
const roleMiddleware = require("../middleware/role.js");

suspendedRouter.post(
  "/suspend",
  authMiddleWare,
  roleMiddleware("admin", "superadmin"),
  suspendUser,
);
suspendedRouter.delete(
  "/unsuspend",
  authMiddleWare,
  roleMiddleware("admin", "superadmin"),
  unsuspendUser,
);
suspendedRouter.get(
  "/all-suspended",
  authMiddleWare,
  roleMiddleware("admin", "superadmin"),
  getAllSuspended,
);
suspendedRouter.get(
  "/get-suspended-by-id/:userId",
  authMiddleWare,
  roleMiddleware("admin", "superadmin"),
  getSuspensionByUser,
);

module.exports = suspendedRouter;
