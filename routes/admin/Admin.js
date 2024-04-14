import express from "express";
import { AuthHandler } from "../../middlewares/AdminAuth.js";
import {
  AddNewStudent,
  GetStudentProfile,
  GetStudents,
} from "../../controller/admin/Student.js";
import { createDepartment } from "../../controller/admin/Department.js";
import { createSemester } from "../../controller/admin/Semester.js";

let router = express.Router();

// post APIs
router.post("/add/student", AuthHandler, AddNewStudent);
router.post("/department/add", AuthHandler, createDepartment);
router.post("/semester/add", AuthHandler, createSemester);

// get APIs
router.get("/get/student/:mobile_no", AuthHandler, GetStudentProfile);
router.get("/get/allStudents", AuthHandler, GetStudents);

export default router;
