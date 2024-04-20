import bcryptjs from "bcryptjs";
import nodemailer from "nodemailer";
import otpGenerator from "otp-generator";
import { ErrorHandler } from "../../middlewares/ErrorHandler.js";
import AdminSchema from "../../models/admin/Admin.js";
import ProfessorSchema from "../../models/professor/Professor.js";
import DepartmentSchema from "../../models/department/Department.js";

export const AddNewProfessor = async (req, res) => {
  let {
    firstName,
    lastName,
    fatherName,
    mobile_no,
    email,
    gender,
    dob,
    religion,
    martial_status,
    national_id,
    national_id_number,
    departments,
    sem_and_subs,
    joining_date,
    current_address,
    qualifications,
    documents,
    achievements,
    position,
  } = req.body;
  try {
    if (
      !firstName ||
      !lastName ||
      !fatherName ||
      !mobile_no ||
      !email ||
      !dob ||
      !religion ||
      !martial_status ||
      !national_id ||
      !national_id_number ||
      !joining_date ||
      !current_address ||
      !qualifications ||
      !documents ||
      !achievements ||
      !position
    ) {
      res
        .status(404)
        .json({ message: "Required fields are Misssing", success: false });
      return;
    } else {
      let professor = await ProfessorSchema.find({
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
      }).select("-documents -current_address -qualifications");
      if (professor.length > 0) {
        res.status(200).json({
          message: "Professor already Exists with provided Info",
          professor,
          success: true,
        });
      } else {
        let pass = otpGenerator.generate(8);
        let hashedPassword = await bcryptjs.hash(pass, 12);
        professor = await ProfessorSchema.create({
          professorID: pass,
          firstName,
          lastName,
          fatherName,
          mobile_no,
          departments,
          email,
          gender,
          dob,
          religion,
          martial_status,
          national_id,
          national_id_number,
          joining_date,
          current_address,
          documents,
          achievements,
          position,
          password: hashedPassword,
          sem_and_subs,
        });
        if (professor) {
          professor = await ProfessorSchema.findByIdAndUpdate(professor._id, {
            current_address: {
              professor_id: professor._id,
              category: "Professor",
              house_no: current_address.house_no,
              street: current_address.street,
              city: current_address.city,
              state: current_address.state,
              postal_code: current_address.postal_code,
            },
          });
          if (professor) {
            let qualification = [];
            Promise.all(
              qualifications.map(async (qlfc) => {
                let eduObj = await ProfessorSchema.findByIdAndUpdate(
                  professor._id,
                  {
                    $push: {
                      qualifications: {
                        professor_id: professor._id,
                        insitute_name: qlfc.insitute_name,
                        passing_year: qlfc.passing_year,
                        qlfc_name: qlfc.qlfc_name,
                      },
                    },
                  }
                );
                return eduObj;
              })
            )
              .then(async (e) => {
                qualification = e;
                if (qualification.length > 0) {
                  let admin = await AdminSchema.find({});

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
                    from: `${process.env.SENDER_NAME} 👻" <${process.env.SENDER_EMAIL}>`,
                    to: email,
                    subject: "Welcome at Dr.MPS Group Of Institutions,Agra",
                    text: `Dear Professor, Mr./Mrs./Ms.${
                      firstName + " " + lastName
                    },

                          Welcome to our college community! We are thrilled to have you join us. Your expertise and passion will undoubtedly inspire our students. Looking forward to an enriching academic journey together.

                          Best regards,
                        
                          ${admin[0].firstName + " " + admin[0].lastName}
                                                      Admin
                          Dr.MPS Group Of Institutions,Agra `,
                    html: `
                    <h4>Dear Professor, Mr./Mrs./Ms.${
                      firstName + " " + lastName
                    }</h4>

                    <p>  Welcome to our college community! We are thrilled to have you join us. Your expertise and  passion will undoubtedly inspire our students. Looking forward to an enriching academic journey together.</p>

                   <span>Best Regards</span>

                   <span> ${admin[0].firstName + " " + admin[0].lastName}</span>
                   <span>Admin</span>
                   <span> Dr.MPS Group Of Institutions,Agra </span>
                    `,
                  });
                  if (info?.accepted.length <= 0 || info?.rejected.length > 0) {
                    professor = await ProfessorSchema.findByIdAndDelete(
                      professor._id
                    );

                    res.status(500).json({
                      message:
                        "Professor Registration failed. Email is not a valid e-mail",
                      success: false,
                    });
                  } else {
                    res.status(201).json({
                      message: "Professor Registered Sussecfully",
                      professor,
                      success: true,
                    });
                  }
                } else {
                  professor = await ProfessorSchema.findByIdAndDelete(
                    professor._id
                  );

                  res.status(500).json({
                    message: "Professor Registration failed ",
                    success: false,
                  });
                }
              })
              .catch(async (err) => {
                professor = await ProfessorSchema.findByIdAndDelete(
                  professor._id
                );

                throw new Error(err);
              });
          } else {
            professor = await ProfessorSchema.findByIdAndDelete(professor._id);

            res.status(400).json({
              message: "Professor Registration failed Due to invalid Address",
              success: false,
            });
          }
        } else {
          res.status(500).json({
            message:
              "Professor Registration failed Pls Try again after Some time",
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

export const AddProfToDept = async (req, res) => {
  let { departmentName, professor_id } = req.body;
  try {
    if (!departmentName || !professor_id) {
      res.status(404).json({
        message: "Oops! I Think you're Missing Some Info",
        success: false,
      });
      return;
    } else {
      let department = await DepartmentSchema.findOne({
        name: departmentName,
      });
      if (department) {
        let ftdProf = await ProfessorSchema.findById(professor_id);

        if (ftdProf) {
          let isDepInclude = await ftdProf?.departments.some(
            (dep) => dep.name === department.name
          );
          if (!isDepInclude) {
            let prof = await ProfessorSchema.findByIdAndUpdate(
              { _id: ftdProf._id },
              {
                $push: {
                  departments: {
                    name: department?.name,
                    depID: department?._id,
                  },
                },
              }
            );
            if (prof) {
              res.status(201).json({
                message: "Professor Assigned to Department",
                success: true,
              });
              return;
            } else {
              res.status(404).json({
                message: "Failed to Add Professsor to Departments",
                success: false,
              });
              return;
            }
          } else {
            res.status(400).json({
              message: "Professor Already Assigned to the Department",
              success: false,
            });
            return;
          }
        } else {
          res.status(404).json({
            message: "Professor Not Found ",
            success: false,
          });
          return;
        }
      } else {
        res.status(400).json({
          message:
            "Department Not found. Please check Department Name or Create New One",
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