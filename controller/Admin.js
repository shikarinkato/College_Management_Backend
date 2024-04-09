import { config } from "dotenv";
import jwt from "jsonwebtoken";
import StudentSchema from "../models/student/StudentSchema.js";
import { ErrorHandler } from "../middlewares/ErrorHandler.js";
import AddressSchema from "../models/student/Address.js";
import EducationSchema from "../models/student/Education.js";

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
      !documents
    ) {
      res
        .status(404)
        .json({ message: "Required fields are Misssing", success: false });
    } else {
      let student = await StudentSchema.find({
        firstName,
        lastName,
        mobile_no,
        national_id,
        national_id_number,
      });
      if (student.length > 0) {
        res
          .status(200)
          .json({ message: "User already Exists", student, success: true });
      } else {
        student = await StudentSchema.create({
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
          documents,
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
                  res.status(200).json({
                    message: "Student Registered Sussecfully",
                    student,
                    success: true,
                  });
                } else {
                  student = await StudentSchema.findByIdAndDelete(student._id);
                  educationInfo.map(async (i) => {
                    student = await EducationSchema.findByIdAndDelete(i._id);
                  });
                  currentAddress = await AddressSchema.findByIdAndDelete(
                    currentAddress._id
                  );
                  res.status(200).json({
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
            res.status(200).json({
              message: "Student Registration failed Due to invalid Address",
              success: false,
            });
          }
        } else {
          res.status(200).json({
            message:
              "Student Registration failed Pls Try again after Some time",
            success: false,
          });
        }
      }
    }
  } catch (error) {
    console.log(error);
    ErrorHandler(req, res, error);
  }
};

export const GetStudentProfile = async (req, res) => {
  let { mobile_no } = req.params;
  try {
    Number(mobile_no);
    if (!mobile_no) {
      res
        .status(404)
        .json({ message: "Required field is Missing", success: false });
    } else {
      let student = await StudentSchema.findOne({ mobile_no });
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
    console.log(error);
    ErrorHandler(req, res, error);
  }
};

export const GetStudents = async (req, res) => {
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
