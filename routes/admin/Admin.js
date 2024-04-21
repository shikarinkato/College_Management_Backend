import express from "express";
import {
  AdminOTP,
  admnLoginOTP,
  CreateAdmin,
  Login,
  VerfiyAdminOTP,
} from "../../controller/admin/Admin.js";
import { createDepartment } from "../../controller/admin/Department.js";
import {
  AddNewProfessor,
  AddProfToDept,
  AssignSemToProfessor,
  UpdateProfSalary,
} from "../../controller/admin/Professor.js";
import { createSemester } from "../../controller/admin/Semester.js";
import {
  AddNewStudent,
  GetAllStudents,
  GetStudentProfile,
} from "../../controller/admin/Student.js";
import { AuthHandler } from "../../middlewares/AdminAuth.js";

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
router.put("/semester/add_professor", AuthHandler, AssignSemToProfessor);
router.put("/prof_salary", AuthHandler, UpdateProfSalary);

export default router;
