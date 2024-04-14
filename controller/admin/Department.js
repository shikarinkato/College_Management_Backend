import { ErrorHandler } from "../../middlewares/ErrorHandler.js";
import DepartmentSchema from "../../models/department/Department.js";

export async function createDepartment(req, res) {
  let { departmentName } = req.body;
  try {
    if (!departmentName) {
      res
        .status(404)
        .json({ message: "Required fields are Missing", success: false });
      return;
    } else {
      let department = await DepartmentSchema.find({ name: departmentName });
      if (department.length > 0) {
        res.status(200).json({
          message: "Department Already Exists",
          department,
          success: true,
        });
      } else {
        department = await DepartmentSchema.create({
          name: departmentName,
          semesters: [],
        });
        if (department) {
          res.status(201).json({
            message: "Department Created Succesfully",
            department,
            success: true,
          });
        } else {
          res.status(500).json({
            message:
              "Soory Currently we're getting issue in Creating Department",
            success: true,
          });
        }
      }
    }
  } catch (error) {
    console.log(error);
    ErrorHandler(req, res, error);
    return;
  }
}
