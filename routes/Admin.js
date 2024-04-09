import express from "express";
import { AuthHandler } from "../middlewares/Auth.js";
import { AddNewStudent, GetStudentProfile, GetStudents } from "../controller/Admin.js";

let router = express.Router();

router.post("/add/student", AuthHandler, AddNewStudent);
router.get("/get/student/:mobile_no", AuthHandler, GetStudentProfile);
router.get("/get/allStudents", AuthHandler, GetStudents);

export default router;
