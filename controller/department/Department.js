import e from "express";
import { ErrorHandler } from "../../middlewares/ErrorHandler.js";
import DepartmentSchema from "../../models/department/Department.js";

export const getAllDepartments = async (req, res) => {
  try {
    let departments = await DepartmentSchema.find({});
    if (departments.length > 0) {
      let dep = departments.length === 1 ? "Department" : "Departments";
      res
        .status(200)
        .json({
          message: `${dep} fetched Successfully`,
          departments,
          success: true,
        });
      return;
    } else {
      res.status(404).json({
        message: "Curently our Organization have 0 Departments",
        success: true,
      });
      return;
    }
  } catch (error) {
    console.log(error);
    ErrorHandler(req, res, error);
  }
};
