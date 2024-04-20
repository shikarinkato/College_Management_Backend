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
  admnLoginOTP,
  CreateAdmin,
  Login,
  VerfiyAdminOTP,
} from "../../controller/admin/Admin.js";
import {
  AddNewProfessor,
  AddProfToDept,
} from "../../controller/admin/Professor.js";

let router = express.Router();

// post APIs
router.post("/add/student", AuthHandler, AddNewStudent);
router.post("/add/professor", AuthHandler, AddNewProfessor);
router.post("/department/add", AuthHandler, createDepartment);
router.post("/semester/add", AuthHandler, createSemester);
router.post("/generateOTP/signup", AdminOTP);
router.post("/generateOTP/login", admnLoginOTP);
router.post("/create/profile", CreateAdmin);

// get APIs
router.get("/get/student/:mobile_no", AuthHandler, GetStudentProfile);
router.get("/get/allStudents", AuthHandler, GetAllStudents);
router.get("/verifyOTP/signup", VerfiyAdminOTP);
router.get("/login", Login);

// put  APIs
router.put("/department/add_professor", AuthHandler, AddProfToDept);


export default router;
