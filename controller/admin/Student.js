import nodemailer from "nodemailer";
import { ErrorHandler } from "../../middlewares/ErrorHandler.js";
import DepartmentSchema from "../../models/department/Department.js";
import SemesterSchema from "../../models/department/Semester.js";
import AddressSchema from "../../models/student/Address.js";
import EducationSchema from "../../models/student/Education.js";
import StudentSchema from "../../models/student/StudentSchema.js";
import bcryptjs from "bcryptjs";
import otpGenerator from "otp-generator";
import mongoose from "mongoose";
import MailSender from "./Admin.js";
import ProfessorSchema from "../../models/professor/Professor.js";

export const AddNewStudent = async (req, res) => {
  let {
    firstName,
    lastName,
    fatherName,
    motherName,
    mobile_no,
    email,
    gender,
    dob,
    religion,
    martial_status,
    blood_group,
    national_id,
    national_id_number,
    addmission_date,
    current_address,
    education,
    documents,
    department,
    semester,
  } = req.body;
  try {
    if (
      !firstName ||
      !lastName ||
      !fatherName ||
      !motherName ||
      !mobile_no ||
      !email ||
      !dob ||
      !religion ||
      !martial_status ||
      !blood_group ||
      !national_id ||
      !national_id_number ||
      !addmission_date ||
      !documents ||
      !department ||
      !semester
    ) {
      res
        .status(404)
        .json({ message: "Required fields are Misssing", success: false });
    } else {
      let student = await StudentSchema.find({
        $or: [
          {
            firstName,
          },
          { lastName },
          { mobile_no },
          {
            $and: [{ national_id }, { national_id_number }],
          },
        ],
      }).select("-documents -current_address -education");
      if (student.length > 0) {
        res.status(200).json({
          message: "Student already Exists with provided Info",
          student,
          success: true,
        });
      } else {
        let students = await StudentSchema.find();
        let pass = await otpGenerator.generate(10);
        let hashedPassword = await bcryptjs.hash(pass, 12);
        firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
        lastName = lastName.charAt(0).toUpperCase() + lastName.slice(1);
        let fullName = firstName + " " + lastName;
        student = await StudentSchema.create({
          studentID: pass,
          firstName,
          lastName,
          fullName,
          fatherName,
          motherName,
          mobile_no,
          email,
          enrollment_no: students.length + 1,
          gender,
          dob,
          religion,
          martial_status,
          blood_group,
          national_id,
          national_id_number,
          addmission_date,
          documents,
          password: hashedPassword,
        });
        if (student) {
          let currentAddress = await AddressSchema.create({
            studentId_or_teacherId: student._id,
            category: "Student",
            house_no: current_address.house_no,
            street: current_address.street,
            city: current_address.city,
            state: current_address.state,
            postal_code: current_address.postal_code,
          });
          if (currentAddress) {
            student = await StudentSchema.findByIdAndUpdate(student._id, {
              current_address: currentAddress._id,
            });
            let educationInfo = [];
            Promise.all(
              education.map(async (i) => {
                let eduObj = await EducationSchema.create({
                  student_id: student._id,
                  school_or_college: i.school_or_college,
                  passing_year: i.passing_year,
                  medium: i.medium,
                  total_marks: i.total_marks,
                });
                return eduObj;
              })
            )
              .then(async (e) => {
                educationInfo = e;
                if (educationInfo.length > 0) {
                  educationInfo.map(async (i) => {
                    student = await StudentSchema.findByIdAndUpdate(
                      student._id,
                      {
                        $push: { education: i._id },
                      }
                    );
                  });
                  let departmentInfo = await DepartmentSchema.find({
                    name: department,
                  });
                  if (departmentInfo.length > 0) {
                    let semesterInfo = await SemesterSchema.find({ semester });
                    if (semesterInfo.length > 0) {
                      semester = await SemesterSchema.findByIdAndUpdate(
                        semesterInfo[0]._id,
                        { $push: { students: student._id } }
                      );
                      student = await StudentSchema.findByIdAndUpdate(
                        student._id,
                        {
                          department: {
                            name: departmentInfo[0].name,
                            id: departmentInfo[0]._id,
                          },
                          semester: {
                            name: semesterInfo[0].semester,
                            id: semesterInfo[0]._id,
                          },
                        }
                      );

                      let prof = await ProfessorSchema.findOne({
                        $and: [
                          {
                            departments: {
                              $elemMatch: { name: department.name },
                            },
                          },
                          { position: "Head of Department (HOD)" },
                        ],
                      });
                      console.log(prof.firstName);
                      if (prof) {
                        const info = await MailSender(
                          email,
                          "Welcome at Dr.MPS Group Of Institutions,Agra",
                          `Dear ${firstName + " " + lastName},

                      Congratulations on your admission to Dr.MPS Group Of Institutions,Agra! 🎉 We're thrilled to welcome you to our community.
                      
                      We're excited for the journey ahead and are here to support you every step of the way. Whether you have questions, need guidance, or want to explore opportunities, our team is here to help.
                      
                      Welcome aboard, ${
                        firstName + " " + lastName
                      }! Let's make your time at Dr.MPS Group Of Institutions,Agra unforgettable!
                      
                      Best regards,
                      
                      ${prof.firstName + " " + prof.lastName},
                      Head of Department/BCA
                      Dr.MPS Group Of Institutions,Agra `,
                          `<h4>Dear ${firstName + " " + lastName},</h4>

                      <p>Congratulations on your admission to Dr.MPS Group Of Institutions,Agra! 🎉 We're thrilled to welcome you to our community.</p>
                      
                      <p>We're excited for the journey ahead and are here to support you every step of the way. Whether you have questions, need guidance, or want to explore opportunities, our team is here to help.</p>
                      
                      <p>Welcome aboard, ${
                        firstName + " " + lastName
                      }! Let's make your time at Dr.MPS Group Of Institutions,Agra unforgettable!</p>
                      
                      <p>Best regards,</p>
                      
                      <p>${prof.firstName + " " + prof.lastName},</p>
                      <p>Head of Department/BCA</p>
                      Dr.MPS Group Of Institutions,Agra `
                        );
                        if (info) {
                          res.status(200).json({
                            message: "Student Registered Sussecfully",
                            student,
                            success: true,
                          });
                        } else {
                          student = await StudentSchema.findByIdAndDelete(
                            student._id
                          );
                          educationInfo.map(async (i) => {
                            student = await EducationSchema.findByIdAndDelete(
                              i._id
                            );
                          });
                          currentAddress =
                            await AddressSchema.findByIdAndDelete(
                              currentAddress._id
                            );
                          res.status(404).json({
                            message: `Registration failed Beacause could not Send Welcome E-mail`,
                            success: false,
                          });
                        }
                      } else {
                        student = await StudentSchema.findByIdAndDelete(
                          student._id
                        );
                        educationInfo.map(async (i) => {
                          student = await EducationSchema.findByIdAndDelete(
                            i._id
                          );
                        });
                        currentAddress = await AddressSchema.findByIdAndDelete(
                          currentAddress._id
                        );
                        res.status(404).json({
                          message: `Registration failed Beacause currently we're unable to find Head Of Department of 
                            ${student.department}`,
                          success: false,
                        });
                      }
                    } else {
                      student = await StudentSchema.findByIdAndDelete(
                        student._id
                      );
                      educationInfo.map(async (i) => {
                        student = await EducationSchema.findByIdAndDelete(
                          i._id
                        );
                      });
                      currentAddress = await AddressSchema.findByIdAndDelete(
                        currentAddress._id
                      );
                      res.status(404).json({
                        message:
                          "There's no Semester with This Name Kindly Create a new One",
                        success: false,
                      });
                    }
                  } else {
                    student = await StudentSchema.findByIdAndDelete(
                      student._id
                    );
                    educationInfo.map(async (i) => {
                      student = await EducationSchema.findByIdAndDelete(i._id);
                    });
                    currentAddress = await AddressSchema.findByIdAndDelete(
                      currentAddress._id
                    );
                    res.status(500).json({
                      message:
                        "Student Registration failed Due to Department not found Pls create Department",
                      success: false,
                    });
                  }
                } else {
                  student = await StudentSchema.findByIdAndDelete(student._id);
                  educationInfo.map(async (i) => {
                    student = await EducationSchema.findByIdAndDelete(i._id);
                  });
                  currentAddress = await AddressSchema.findByIdAndDelete(
                    currentAddress._id
                  );
                  res.status(500).json({
                    message:
                      "Student Registration failed Due to invalid Education Info",
                    success: false,
                  });
                }
              })
              .catch((err) => {
                throw new Error(err);
              });
          } else {
            student = await StudentSchema.findByIdAndDelete(student._id);
            currentAddress = await AddressSchema.findByIdAndDelete(
              currentAddress._id
            );
            res.status(500).json({
              message: "Student Registration failed Due to invalid Address",
              success: false,
            });
          }
        } else {
          res.status(500).json({
            message:
              "Student Registration failed Pls Try again after Some time",
            success: false,
          });
        }
      }
    }
  } catch (error) {
    // console.log(error);
    ErrorHandler(req, res, error);
  }
};

export const GetStudentProfile = async (req, res) => {
  let { vrfNameOrNumber } = req.body;
  try {
    if (!vrfNameOrNumber) {
      res
        .status(404)
        .json({ message: "Required field is Missing", success: false });
    } else {
      let student;
      if (typeof vrfNameOrNumber === "number") {
        student = await StudentSchema.findOne({
          mobile_no: vrfNameOrNumber,
        });
      } else {
        student = await StudentSchema.findOne({
          studentID: vrfNameOrNumber,
        });
      }
      if (student) {
        res.status(200).json({
          message: `Welcome Back ${student.firstName}`,
          student,
          success: true,
        });
      } else {
        res.status(404).json({
          message: "No student found pls check the number you entered",
          success: false,
        });
      }
    }
  } catch (error) {
    ErrorHandler(req, res, error);
  }
};

export const updateStudentFee = async (req, res) => {
  let { amount, semName, student_id } = req.body;
  try {
    if (!amount || !semName || !student_id) {
      res
        .status(404)
        .json({ message: "Required fields are Missing", success: false });
      return;
    } else {
      let student = await StudentSchema.findById(student_id);
      if (student) {
        let sem = await SemesterSchema.findOne({
          semester: semName,
        });
        if (sem) {
          let isSemIncd = student.fees?.some(
            (i) => i.semester.name === semName
          );
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
                  {
                    arrayFilters: [{ "elem.semester.name": semName }],
                    new: true,
                  }
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
                      "fees.$[elem].fee.due_fee": Math.min(0, dueFee),
                      "fees.$[elem].fee.submitted_fee": submittedFee + dueFee,
                    },
                  },
                  {
                    arrayFilters: [{ "elem.semester.name": semName }],
                    new: true,
                  }
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
                "Please Provide the Semester that Student have Passed or Currently Attending",
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
      } else {
        res.status(404).json({
          message: "Sorry we can't find any Student with provided info.",
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

export const GetAllStudents = async (req, res) => {
  try {
    let students = await StudentSchema.find();
    if (students.length > 0) {
      res.status(200).json({
        message: `All Students fetched Succesfully`,
        students,
        success: true,
      });
    } else {
      res.status(404).json({
        message: "No student found pls check the number you entered",
        success: false,
      });
    }
  } catch (error) {
    console.log(error);
    ErrorHandler(req, res, error);
  }
};
