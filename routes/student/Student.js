import express from "express";
import { GetStudentProfile } from "../../controller/admin/Student.js";
import { GetProfile } from "../../controller/student/Student.js";

let router = express.Router();

router.put("/getprofile", GetProfile);

export default router;
