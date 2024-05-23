import bcryptjs from "bcryptjs";
import StudentSchema from "../../models/student/StudentSchema.js";
import { ErrorHandler } from "../../middlewares/ErrorHandler.js";
import jwt from "jsonwebtoken";
import SemesterSchema from "../../models/department/Semester.js";

export const getProfile = async (req, res) => {
  let { emailOrMobileNumber, password } = req.body;
  try {
    if (!emailOrMobileNumber || !password) {
      res
        .status(404)
        .json({ message: "Required fields are Missing", success: false });
      return;
    } else {
      let student;

      if (typeof emailOrMobileNumber === "string") {
        student = await StudentSchema.findOne({
          email: emailOrMobileNumber,
        });
      } else if (typeof emailOrMobileNumber === "number") {
        student = await StudentSchema.findOne({
          mobile_no: emailOrMobileNumber,
        });
      } else {
        res.status(400).json({
          message: "Please Provide an Valid type of ID for Login",
          success: false,
        });
        return;
      }

      if (student) {
        let isMatchedPass = await bcryptjs.compare(password, student.password);
        if (isMatchedPass) {
          const token = jwt.sign(
            { id: student._id },
            process.env.STUDENT_LOGIN_SECRET_KEY,
            { expiresIn: "5d" }
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
          message: "There's no student with specific Details ",
          success: false,
        });
      }
    }
  } catch (error) {
    console.log(error);
    ErrorHandler(req, res, error);
  }
};

export const updateFee = async (req, res) => {
  let student = req.student;
  let { amount, semName } = req.body;
  try {
    if (!amount || !semName || !student) {
      res
        .status(404)
        .json({ message: "Required fields are Missing", success: false });
      return;
    } else {
      let sem = await SemesterSchema.findOne({
        semester: semName,
      });
      if (sem) {
        let isSemIncd = student.fees?.some((i) => i.semester.name === semName);
        if (isSemIncd) {
          student = await StudentSchema.findOne({
            $and: [
              { _id: student._id },
              {
                fees: {
                  $elemMatch: {
                    semester: { name: semName },
                    "fee.due_fee": { $gt: 0 },
                  },
                },
              },
            ],
          });
          if (student) {
            let feeIndex = student.fees.findIndex(
              (f) => f.semester.name === semName && f.fee.due_fee > 0
            );
            let feeNndToSbmt;
            let excessAmount;
            let dueFee = student.fees[feeIndex]?.fee.due_fee;
            let submittedFee = student.fees[feeIndex]?.fee.submitted_fee;

            if (dueFee > amount || dueFee === amount) {
              feeNndToSbmt = amount;
              excessAmount = 0;
              student = await StudentSchema.findOneAndUpdate(
                {
                  $and: [
                    { _id: student._id },
                    {
                      fees: {
                        $elemMatch: {
                          semester: { name: semName },
                          "fee.due_fee": { $gt: 0 },
                        },
                      },
                    },
                  ],
                },
                {
                  $set: {
                    "fees.$[elem].fee.due_fee": Math.max(
                      0,
                      dueFee - feeNndToSbmt
                    ),
                    "fees.$[elem].fee.submitted_fee":
                      submittedFee + feeNndToSbmt,
                  },
                },
                { arrayFilters: [{ "elem.semester.name": semName }], new: true }
              );
            } else {
              feeNndToSbmt = dueFee;
              excessAmount = amount - dueFee;
              student = await StudentSchema.findOneAndUpdate(
                {
                  $and: [
                    { _id: student._id },
                    {
                      fees: {
                        $elemMatch: {
                          semester: { name: semName },
                          "fee.due_fee": { $gt: 0 },
                        },
                      },
                    },
                  ],
                },
                {
                  $set: {
                    "fees.$[elem].fee.due_fee": 0,
                    "fees.$[elem].fee.submitted_fee":
                      submittedFee + feeNndToSbmt,
                  },
                },
                { arrayFilters: [{ "elem.semester.name": semName }], new: true }
              );
            }

            if (student) {
              res.status(200).json({
                message: "Fee Updated Succesfully",
                student,
                success: true,
              });
              return;
            } else {
              res.status(500).json({
                message:
                  "Failed to Submit fee. Please try again after Sometime",
                success: false,
              });
              return;
            }
          } else {
            res.status(400).json({
              message: "Please Check the Provided Semester Fee Due or Not",
              success: false,
            });
            return;
          }
        } else {
          res.status(404).json({
            message:
              "Please Provide the Semester that you've Passed or Currently Attending",
            success: false,
          });
          return;
        }
      } else {
        res.status(404).json({
          message: "Can't Find any Semester with Provided Info.",
          success: false,
        });
        return;
      }
    }
  } catch (error) {
    console.log(error);
    ErrorHandler(req, res, error);
  }
};
