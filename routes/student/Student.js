import express from "express";
import { getProfile } from "../../controller/student/Student.js";
import { StudentAuth } from "../../middlewares/StudentAuth.js";

let router = express.Router();

router.put("/getprofile", getProfile);
router.put("/submit_fee", StudentAuth, getProfile);

export default router;
