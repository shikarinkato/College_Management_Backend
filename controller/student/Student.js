import bcryptjs from "bcryptjs";
import StudentSchema from "../../models/student/StudentSchema.js";
import { ErrorHandler } from "../../middlewares/ErrorHandler.js";
import jwt from "jsonwebtoken";
import SemesterSchema from "../../models/department/Semester.js";

export const getProfile = async (req, res) => {
  let { mobile_no, password } = req.body;
  try {
    if (!mobile_no || !password) {
      res
        .status(404)
        .json({ message: "Required fields are Missing", success: false });
      return;
    } else {
      let student = await StudentSchema.findOne({ mobile_no });
      if (student) {
        let isMatchedPass = await bcryptjs.compare(password, student.password);
        if (isMatchedPass) {
          const token = jwt.sign(
            { id: student._id },
            process.env.STUDENT_LOGIN_SECRET_KEY
          );
          if (token) {
            res.status(404).json({
              message: "Student profile Fetched Succesfully",
              student,
              token,
              success: true,
            });
            return;
          } else {
            res.status(500).json({
              message:
                "Sorry Currenlty we're facing issue in Get You Logged in",
              success: false,
            });
            return;
          }
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

// This function is Not Completed Yet

// export const updateFee = async (req, res) => {
//   let { student } = req.student;
//   let { amount, semName } = req.body;
//   try {
//     if (!amount || !semName || !student) {
//       res
//         .status(404)
//         .json({ message: "Required fields are Missing", success: false });
//       return;
//     } else {
//       let sem = await SemesterSchema.findOne({
//         semester: semName,
//       });
//       if (sem) {
//         let isSemMatch = student.semester.name === semName;
//         if (isSemMatch) {
//           console.log(isSemMatch);
//           // student = await StudentSchema.findOne({
//           //   $and: [{ _id: student._id }, { studentID: student.studentID }],
//           // });
//         } else {
//           res.status(400).json({
//             message: "Please Check the Provided Semester",
//             success: false,
//           });
//           return;
//         }
//       } else {
//         res.status(404).json({
//           message: "Can't Find any Semester with Provided Info.",
//           success: false,
//         });
//         return;
//       }
//     }
//   } catch (error) {
//     console.log(error);
//     ErrorHandler(req, res, error);
//   }
// };
