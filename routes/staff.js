const express = require("express");
const staffRouter = express.Router();
const authMiddleWare = require("../middleware/auth");
const {
  createAdmin,
  denyUser,
  approveUser,
  getAllStaff,
  staffLogin,
} = require("../controller/staff.js");
const roleMiddleware = require("../middleware/role.js");
staffRouter.get(
  "/all-staff",
  authMiddleWare,
  roleMiddleware("admin", "superadmin"),
  getAllStaff,
);
staffRouter.post("/create-admin", authMiddleWare, createAdmin);
staffRouter.post(
  "/approve-user/:id",
  authMiddleWare,
  roleMiddleware("superadmin"),
  approveUser,
);
staffRouter.delete(
  "/deny-admin/:id",
  authMiddleWare,
  roleMiddleware("superadmin"),
  denyUser,
);
staffRouter.post("/login", staffLogin);

module.exports = staffRouter;
