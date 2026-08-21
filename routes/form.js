const express = require("express");
const formRouter = express.Router();
const {
  signup,
  login,
  driverSignup,
  verifyOTP,
  verifyToken,
  uploadCarImage,
  verifyGoogleToken,
  getCode,
} = require("../controller/form.js");

formRouter.post("/signup", signup);
formRouter.get("/send-verify-email", getCode);
formRouter.post("/verify-otp", verifyOTP);
formRouter.post("/verify-token", verifyToken);
formRouter.post("/login", login);
formRouter.post("/upload", uploadCarImage);
formRouter.post("/driver-signup", driverSignup);
formRouter.post("/auth/google", verifyGoogleToken);

module.exports = formRouter;
