import bcryptjs from "bcryptjs";
import StudentSchema from "../../models/student/StudentSchema.js";
import { ErrorHandler } from "../../middlewares/ErrorHandler.js";

export const GetProfile = async (req, res) => {
  let { mobile_no, password } = req.body;
  try {
    if (!mobile_no || !password) {
      res
        .status(404)
        .json({ message: "Required field is Missing", success: false });
    } else {
      let student = await StudentSchema.findOne({ mobile_no });
      if (student) {
        let isMatchedPass = await bcryptjs.compare(password, student.password);
        if (isMatchedPass) {
          res.status(404).json({
            message: "Student profile Fetched Succesfully",
            student,
            success: true,
          });
        } else {
          res.status(403).json({
            message: "Invalid Credentials",
            success: false,
          });
        }
      } else {
        res.status(404).json({
          message: "There's no student with specific Mobile Number",
          success: false,
        });
      }
    }
  } catch (error) {
    console.log(error);
    ErrorHandler(req, res, error);
  }
};
