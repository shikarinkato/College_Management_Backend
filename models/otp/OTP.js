import mongoose from "mongoose";

const OTP = mongoose.Schema(
  {
    otp: { type: Number, required: true },
    email: { type: String, required: true },
    expirationTime: { type: Number, required: true },
  },
  { timestamp: true }
);

const OtpSchema = mongoose.model("Otp", OTP);

export default OtpSchema;
