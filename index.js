import { config } from "dotenv";
import express from "express";
import jwt from "jsonwebtoken";
import AdminRouter from "./routes/admin/Admin.js";
import StudentRouter from "./routes/student/Student.js";
import ProfessorRouter from "./routes/professor/Professor.js";
import HODRouter from "./routes/HOD/HOD.js";
import EventRouter from "./routes/events/Event.js";
import DepartmentRouter from "./routes/department/Department.js";
import OtpSchema from "./models/otp/OTP.js";
import { ErrorHandler } from "./middlewares/ErrorHandler.js";
import cron from "node-cron";
import limiter from "./middlewares/RateLimiter.js";

config({ path: "./db/config.env" });
export const app = express();

app.use(limiter);
app.use(express.json());

// for otp schema expiration
cron.schedule("* * * * * *", CheckOtps);

async function CheckOtps(req, res) {
  try {
    let currentTime = Date.now();

    let otps = await OtpSchema.find({ expirationTime: { $lt: currentTime } });

    if (otps.length > 0) {
      let dltOTPs = await OtpSchema.deleteMany({
        expirationTime: { $lt: currentTime },
      });
      console.log(dltOTPs);
      if (dltOTPs.deletedCount > 0) {
        console.log("Done! Expired OTPs Deleted Successfully");
      } else {
        console.log("Failed to Delete Expired OTPs");
      }
    } else {
      return;
    }
  } catch (error) {
    ErrorHandler(req, res, error);
  }
}

app.get("/", (req, res) => {
  res.send("Hii lavdya");
});

app.use("/api/v1/admin", AdminRouter);
app.use("/api/v1/student", StudentRouter);
app.use("/api/v1/professor", ProfessorRouter);
app.use("/api/v1/hod", HODRouter);
app.use("/api/v1/events", EventRouter);
app.use("/api/v1/departments", DepartmentRouter);
