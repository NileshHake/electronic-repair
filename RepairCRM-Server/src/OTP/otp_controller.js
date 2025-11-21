const twilio = require("twilio");
const otpStore = {}; // Temporary store: phone -> OTP

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Generate random 6-digit OTP
const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// Send OTP
const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone)
      return res.status(400).json({ message: "Phone number is required" });

    const otp = generateOtp();
    otpStore[phone] = { otp, expires: Date.now() + 2 * 60 * 1000 }; // Expires in 2 mins

    await client.messages.create({
      body: `Your OTP is: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER, // e.g., +1234567890 (Twilio number)
      to: phone.startsWith("+") ? phone : `+91${phone}`, // prepend country code if missing
    });
    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to send OTP", error: error.message });
  }
};

// Verify OTP
const verifyOtp = (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp)
    return res.status(400).json({ message: "Phone and OTP required" });

  const record = otpStore[phone];
  if (!record)
    return res.status(400).json({ message: "No OTP sent to this number" });

  if (Date.now() > record.expires) {
    delete otpStore[phone];
    return res.status(400).json({ message: "OTP expired" });
  }

  if (record.otp !== otp)
    return res.status(400).json({ message: "Invalid OTP" });

  delete otpStore[phone]; // OTP is used
  res.status(200).json({ message: "OTP verified successfully" });
};

module.exports = {
  sendOtp,
  verifyOtp,
};
