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
  updateStudentFee,
} from "../../controller/admin/Student.js";
import { AdminAuthHandler } from "../../middlewares/AdminAuth.js";

let router = express.Router();

// post APIs
router.post("/add/student", AdminAuthHandler, AddNewStudent);
router.post("/add/professor", AdminAuthHandler, AddNewProfessor);
router.post("/department/add", AdminAuthHandler, createDepartment);
router.post("/semester/add", AdminAuthHandler, createSemester);
router.post("/generateOTP/signup", AdminOTP);
router.post("/generateOTP/login", admnLoginOTP);
router.post("/create/profile", CreateAdmin);

// get APIs
router.get("/get/student/:mobile_no", AdminAuthHandler, GetStudentProfile);
router.get("/get/allStudents", AdminAuthHandler, GetAllStudents);
router.get("/verifyOTP/signup", VerfiyAdminOTP);
router.get("/login", Login);

// put  APIs
router.put("/department/add_professor", AdminAuthHandler, AddProfToDept);
router.put("/semester/add_professor", AdminAuthHandler, AssignSemToProfessor);
router.put("/prof_salary", AdminAuthHandler, UpdateProfSalary);
router.put("/student/submit_fee", AdminAuthHandler, updateStudentFee);

export default router;
