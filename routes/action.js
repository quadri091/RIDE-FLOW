const {
  getResetCode,
  updateLocation,
  emailCode,
  changeUserEmail,
  updateDetails,
  confirmPasswordOTP,
  resetPassword,
  changeUserPassword,
  uploadPicture,
  activeSwitch,
  getNearbyDrivers,
  getAllActiveDrivers,
  updateNumber,
  confirmUpdateNumber,
} = require("../controller/action");
const express = require("express");
const authMiddleWare = require("../middleware/auth.js");
const actionRouter = express.Router();

actionRouter.post("/get-reset-code", authMiddleWare, getResetCode);
actionRouter.post("/verify-reset-password", authMiddleWare, confirmPasswordOTP);
actionRouter.post("/apply-reset-password", authMiddleWare, resetPassword);
actionRouter.post("/update-location", authMiddleWare, updateLocation);
actionRouter.post("/change-user-password", authMiddleWare, changeUserPassword);
actionRouter.post("/update-user-picture", authMiddleWare, uploadPicture);
actionRouter.post("/update-user-details", authMiddleWare, updateDetails);
actionRouter.post("/change-user-email", authMiddleWare, changeUserEmail);
actionRouter.post("/verify-user-email", authMiddleWare, emailCode);
actionRouter.post("/toggle-active", authMiddleWare, activeSwitch);
actionRouter.post("/get-nearby-drivers", authMiddleWare, getNearbyDrivers);
actionRouter.post(
  "/get-all-active-drivers",
  authMiddleWare,
  getAllActiveDrivers,
);
actionRouter.post("/update-number", authMiddleWare, updateNumber);
actionRouter.post(
  "/confirm-update-number",
  authMiddleWare,
  confirmUpdateNumber,
);

module.exports = actionRouter;
