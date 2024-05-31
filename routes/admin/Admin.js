import express from "express";
import {
  AdminOTP,
  admnLgnInfUpdtnOTP,
  admnLoginOTP,
  CreateAdmin,
  getAdminProfile,
  Login,
  updateAdminLoginInfo,
  UpdateAdminPassword,
  UpdateAdminProfile,
  VerfiyAdminOTP,
} from "../../controller/admin/Admin.js";
import { createDepartment } from "../../controller/admin/Department.js";
import {
  AddNewProfessor,
  AddProfToDept,
  AssignSemToProfessor,
  getAllProfessors,
  getPfrssBySearch,
  sendNoticeToPrf,
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
import { EventPush } from "../../controller/professor/Event.js";

let router = express.Router();

// post APIs
router.post("/add/student", AdminAuthHandler, AddNewStudent);
router.post("/add/professor", AdminAuthHandler, AddNewProfessor);
router.post("/department/add", AdminAuthHandler, createDepartment);
router.post("/semester/add", AdminAuthHandler, createSemester);
router.post("/generateOTP/signup", AdminOTP);
router.post("/generateOTP/login", admnLoginOTP);
router.post("/create/profile", CreateAdmin);
router.post("/create/event", AdminAuthHandler, EventPush);
router.post(
  "/generateOTP/update_login_ids",
  AdminAuthHandler,
  admnLgnInfUpdtnOTP
);
router.post("/notice/professor", AdminAuthHandler, sendNoticeToPrf);

// get APIs
router.get("/get/student/", AdminAuthHandler, GetStudentProfile);
router.get("/get/profile", AdminAuthHandler, getAdminProfile);
router.get("/get/allStudents", AdminAuthHandler, GetAllStudents);
router.get("/get/all_professors", AdminAuthHandler, getAllProfessors);
router.get("/verifyOTP/signup", VerfiyAdminOTP);
router.get("/login", Login);
router.get("/get/professor_query", AdminAuthHandler, getPfrssBySearch);

// put  APIs
router.put("/department/add_professor", AdminAuthHandler, AddProfToDept);
router.put("/semester/add_professor", AdminAuthHandler, AssignSemToProfessor);
router.put("/prof_salary", AdminAuthHandler, UpdateProfSalary);
router.put("/student/submit_fee", AdminAuthHandler, updateStudentFee);
router.put("/update/profile/:mobileNo", AdminAuthHandler, UpdateAdminProfile);
router.put("/update/admin_pass", AdminAuthHandler, UpdateAdminPassword);
router.put("/update/login_ids", AdminAuthHandler, updateAdminLoginInfo);

export default router;
