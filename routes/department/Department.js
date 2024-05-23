import express from "express";
import { getAllDepartments } from "../../controller/department/Department.js";

const router = express.Router();

router.get("/get/all_departments", getAllDepartments);

export default router;
