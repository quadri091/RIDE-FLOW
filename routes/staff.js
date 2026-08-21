const express = require("express");
const staffRouter = express.Router();
const authMiddleWare = require("../middleware/auth");
const {
  createAdmin,
  denyUser,
  approveUser,
  getAllStaff,
  staffLogin,
  verifyStaffToken,
} = require("../controller/staff.js");
const roleMiddleware = require("../middleware/role.js");
staffRouter.get(
  "/all-staff",
  authMiddleWare,
  roleMiddleware("admin", "superadmin"),
  getAllStaff,
);
staffRouter.post("/create-admin", createAdmin);
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
staffRouter.post("/verify-staff-token", verifyStaffToken);
module.exports = staffRouter;
