import nodemailer from "nodemailer";
import { ErrorHandler } from "../../middlewares/ErrorHandler.js";
import DepartmentSchema from "../../models/department/Department.js";
import SemesterSchema from "../../models/department/Semester.js";
import AddressSchema from "../../models/student/Address.js";
import EducationSchema from "../../models/student/Education.js";
import StudentSchema from "../../models/student/StudentSchema.js";
import bcryptjs from "bcryptjs";
import otpGenerator from "otp-generator";

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
        student = await StudentSchema.create({
          studentID: pass,
          firstName,
          lastName,
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

                      const transporter = nodemailer.createTransport({
                        host: "smtp-relay.brevo.com",
                        port: 587,
                        secure: false,
                        auth: {
                          user: process.env.SMTP_SERVER_AUTH,
                          pass: process.env.SMTP_SERVER_PASS,
                        },
                      });

                      const info = await transporter.sendMail({
                        from: `Raman 👻" <${process.env.SENDER_EMAIL}>`,
                        to: email,
                        subject: "Welcome at Dr.MPS Group Of Institutions,Agra",
                        text: `Dear ${firstName + " " + lastName},

                        Congratulations on your admission to Dr.MPS Group Of Institutions,Agra! 🎉 We're thrilled to welcome you to our community.
                        
                        We're excited for the journey ahead and are here to support you every step of the way. Whether you have questions, need guidance, or want to explore opportunities, our team is here to help.
                        
                        Welcome aboard, ${
                          firstName + " " + lastName
                        }! Let's make your time at Dr.MPS Group Of Institutions,Agra unforgettable!
                        
                        Best regards,
                        
                        Raman Pratp Singh
                        Head of Department/BCA
                        Dr.MPS Group Of Institutions,Agra `,
                      });

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
                    res.status(200).json({
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
    // console.log(error);
    ErrorHandler(req, res, error);
  }
};

export const GetStudentProfile = async (req, res) => {
  let {
    firstName,
    lastName,
    vrfNameOrNumber,
    national_id,
    national_id_number,
  } = req.body;
  try {
    if (!vrfNameOrNumber) {
      res
        .status(404)
        .json({ message: "Required field is Missing", success: false });
    } else {
      let student;
      if (typeof vrfNameOrNumber === "number") {
        student = await StudentSchema.findOne({
          $or: [
            { mobile_no: vrfNameOrNumber },
            { enrollment_no: vrfNameOrNumber },
            { $and: [{ national_id }, { national_id_number }] },
          ],
        });
      } else {
        student = await StudentSchema.findOne({
          $or: [
            {
              studentID: vrfNameOrNumber,
            },
            { $and: [{ firstName }, { lastName }] },
            { $and: [{ national_id }, { national_id_number }] },
          ],
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
