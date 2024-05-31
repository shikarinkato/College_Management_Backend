import express from "express";
import {
  getProfile,
  searchStudent,
  updateFee,
} from "../../controller/student/Student.js";
import { StudentAuth } from "../../middlewares/StudentAuth.js";
import { AdminAuthHandler } from "../../middlewares/AdminAuth.js";

let router = express.Router();

//get Requests

// For Admin Only
router.get("/search", AdminAuthHandler, searchStudent);
router.get("/getprofile", getProfile);

// put Requests
router.put("/submit_fee", StudentAuth, updateFee);

export default router;
