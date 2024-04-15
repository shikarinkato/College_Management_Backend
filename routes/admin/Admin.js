import express from "express";
import { createDepartment } from "../../controller/admin/Department.js";
import { createSemester } from "../../controller/admin/Semester.js";
import {
  AddNewStudent,
  GetAllStudents,
  GetStudentProfile,
} from "../../controller/admin/Student.js";
import { AuthHandler } from "../../middlewares/AdminAuth.js";
import {
  AdminOTP,
  CreateAdmin,
  VerfiyAdminOTP,
} from "../../controller/admin/Admin.js";

let router = express.Router();

// post APIs
router.post("/add/student", AuthHandler, AddNewStudent);
router.post("/department/add", AuthHandler, createDepartment);
router.post("/semester/add", AuthHandler, createSemester);

// get APIs
router.get("/get/student/:mobile_no", AuthHandler, GetStudentProfile);
router.get("/get/allStudents", AuthHandler, GetAllStudents);
router.get("/verifyOTP", VerfiyAdminOTP);

// put APIs
router.post("/generateOTP", AdminOTP);
router.post("/create/profile", CreateAdmin);

export default router;
