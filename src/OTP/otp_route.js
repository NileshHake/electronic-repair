const express = require("express");
const router = express.Router();
const controller = require("./otp_controller");

// Send OTP
router.post("/send-otp", controller.sendOtp);

// Verify OTP
router.post("/verify-otp", controller.verifyOtp);

module.exports = router;
