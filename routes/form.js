const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  driverSignup,
  verifyOTP,
  verifyToken,
  verifyGoogleToken,
  forgetPassword,
} = require("../controller/form.js");
const usermodel = require("../model/form-model.js");
const { model } = require("mongoose");

router.post("/signup", signup);
router.post("/forget-password", forgetPassword);
router.post("/verify-otp", verifyOTP);
router.post("/verify-token", verifyToken);
router.post("/login", login);
router.post("/driver-signup", driverSignup);
router.post("/auth/google", verifyGoogleToken);

module.exports = router;
