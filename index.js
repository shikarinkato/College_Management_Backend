import { config } from "dotenv";
import express from "express";
import jwt from "jsonwebtoken";
import AdminRouter from "./routes/admin/Admin.js";
import StudentRouter from "./routes/student/Student.js";
import OtpSchema from "./models/otp/OTP.js";
import { ErrorHandler } from "./middlewares/ErrorHandler.js";
import cron from "node-cron";

config({ path: "./db/config.env" });
export const app = express();

// for otp schema expiration
cron.schedule("* * * * * *", CheckOtps);
async function CheckOtps(req, res) {
  try {
    let otps = await OtpSchema.find({});
    if (otps.length > 0) {
      let currentTime = Date.now();
      let dltOTPs = Promise.all(
        otps.map(async (otp) => {
          if (currentTime > otp.expirationTime) {
            return (otp = await OtpSchema.findOneAndDelete({ otp: otp.otp }));
          } else {
            return null;
          }
        })
      );

      dltOTPs
        .then((resp) => {
          if (resp[0] !== null) {
            console.log("Done! Removed expired OTPs", resp.otp);
          }
          return;
        })
        .catch((err) => {
          throw new Error(err);
        });
    } else {
      // console.log("There's no OTPs left ", otps.length);
      return;
    }
  } catch (error) {
    console.log(error);
    ErrorHandler(req, res, error);
  }
}

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hii lavdya");
});

app.use("/api/v1/admin", AdminRouter);
app.use("/api/v1/student", StudentRouter);
