import bcryptjs from "bcryptjs";
import nodemailer from "nodemailer";
import otpGenerator from "otp-generator";
import { ErrorHandler } from "../../middlewares/ErrorHandler.js";
import AdminSchema from "../../models/admin/Admin.js";
import ProfessorSchema from "../../models/professor/Professor.js";
import DepartmentSchema from "../../models/department/Department.js";
import SemesterSchema from "../../models/department/Semester.js";
import NoticeSchema from "../../models/notice/Notice.js";
import MailSender from "./Admin.js";

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
        firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
        lastName = lastName.charAt(0).toUpperCase() + lastName.slice(1);
        let fullName = firstName + " " + lastName;
        professor = await ProfessorSchema.create({
          professorID: pass,
          firstName,
          lastName,
          fullName,
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

                  const info = await MailSender(
                    email,
                    "Welcome at Dr.MPS Group Of Institutions,Agra",
                    `Dear Professor, Mr./Mrs./Ms.${firstName + " " + lastName},

                        Welcome to our college community! We are thrilled to have you join us. Your expertise and passion will undoubtedly inspire our students. Looking forward to an enriching academic journey together.

                        Best regards,
                      
                        ${admin[0].firstName + " " + admin[0].lastName}
                                                    Admin
                        Dr.MPS Group Of Institutions,Agra`,
                    `
                        <h4>Dear Professor, Mr./Mrs./Ms.${
                          firstName + " " + lastName
                        }</h4>
    
                        <p>  Welcome to our college community! We are thrilled to have you join us. Your expertise and  passion will undoubtedly inspire our students. Looking forward to an enriching academic journey together.</p>
    
                       <span>Best Regards</span>
    
                       <span> ${
                         admin[0].firstName + " " + admin[0].lastName
                       }</span>
                       <span>Admin</span>
                       <span> Dr.MPS Group Of Institutions,Agra </span>
                        `
                  );

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
                ErrorHandler(req, res, err);
                professor = await ProfessorSchema.findByIdAndDelete(
                  professor._id
                );
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
        let isHOD = ftdProf.position === "Head of Department(HOD)";
        let isDepPrvd = ftdProf.departments.length > 0;
        if (isHOD && isDepPrvd) {
          res.status(400).json({
            message:
              "A HOD of a Department Can't have More than one Department",
            success: false,
          });
        } else {
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
              res.status(200).json({
                message: "Professor Already Assigned to the Department",
                ftdProf,
                success: true,
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

export const AssignSemToProfessor = async (req, res) => {
  let { semName, professor_id, subject } = req.body;
  try {
    if (!semName || !professor_id || !subject) {
      res.status(404).json({
        message: "Oops! I Think We're Missing Some Imp. Info",
        success: false,
      });
      return;
    } else {
      let prof = await ProfessorSchema.findById(professor_id);
      if (prof) {
        let sem = await SemesterSchema.findOne({ semester: semName });
        if (sem) {
          let profDeps;
          if (prof?.departments) {
            Promise.all(
              prof.departments.map(async (dep) => {
                let dept = await DepartmentSchema.findById(dep.depID);
                return dept;
              })
            )
              .then((resp) => {
                resp.map(async (dep) => {
                  if (dep.semesters.some((i) => i.name === semName)) {
                    let isInclude = prof.sem_and_subs?.some(
                      (smst) => smst.semester.name === semName
                    );
                    if (!isInclude) {
                      prof = await ProfessorSchema.findByIdAndUpdate(prof._id, {
                        $push: {
                          sem_and_subs: {
                            semester: { name: sem.semester, id: sem._id },
                            subject: { name: subject },
                          },
                        },
                      });
                      res.status(201).json({
                        message: "Semester Assigned Succesfully",
                        assignedSem: prof.sem_and_subs,
                        success: true,
                      });
                      return;
                    } else {
                      res.status(200).json({
                        message: "Semester Already Assigned to Professor",
                        assignedSem: prof.sem_and_subs,
                        success: true,
                      });
                      return;
                    }
                  }
                });
              })
              .catch((err) => {
                throw new Error(err);
              });
          } else {
            res.status(404).json({
              message: "There's no Department Assingeed to Professor",
              success: false,
            });
            return;
          }
        } else {
          res.status(404).json({
            message:
              "There's no Semester With Specific Name. Please Check And Try Again",
            success: false,
          });
          return;
        }
      } else {
        res.status(400).json({
          message: "Professor Not Found. Please register Professor First",
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

export const UpdateProfSalary = async (req, res) => {
  let { professor_id, salary } = req.body;
  try {
    if (!salary || !professor_id) {
      res.status(404).json({
        message: "Oops! I Think We're Missing Some Imp. Info",
        success: false,
      });
      return;
    } else {
      let prof = await ProfessorSchema.findById(professor_id);
      if (prof) {
        prof = await ProfessorSchema.findByIdAndUpdate(prof._id, {
          salary,
        });
        if (prof) {
          res.status(201).json({
            message: "Succesfully Updated Your Salary",
            salary: prof.salary,
            success: true,
          });
          return;
        } else {
          res.status(500).json({
            message:
              "Sorry Currently We're Facing issue in Updating Your Salary",
            success: false,
          });
          return;
        }
      } else {
        res.status(400).json({
          message: "There ain't Any Professor With this Info.",
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

export const getAllProfessors = async (req, res) => {
  try {
    let prfrs = await ProfessorSchema.find({});
    if (prfrs.length > 0) {
      res.status(200).json({
        message: "All Professors fetched Succesfully",
        prfrs,
        success: true,
      });
    } else {
      res
        .status(404)
        .json({ message: "Can't find any Professor", success: false });
    }
  } catch (error) {
    console.log(error);
    ErrorHandler(req, res, error);
  }
};

export const getPfrssBySearch = async (req, res) => {
  let { pName } = req.query;
  try {
    if (!pName) {
      res
        .status(404)
        .json({ message: "Required fields are Missing", success: false });
      return;
    } else {
      let prof = await ProfessorSchema.find({
        $or: [
          { firstName: { $regex: `${pName}`, $options: "i" } },
          { lastName: { $regex: `${pName}`, $options: "i" } },
        ],
      });
      if (prof.length > 0) {
        let prf = prof.length > 1 ? "Professors" : "Professor";
        res.status(200).json({
          message: `${prf} fetched Succesfully`,
          prof,
          success: false,
        });
        return;
      } else {
        res.status(404).json({ message: "0 Professor found", success: false });
        return;
      }
    }
  } catch (error) {
    console.log(error);
    ErrorHandler(req, res, error);
  }
};

export const sendNoticeToPrf = async (req, res) => {
  let admin = req.admin;
  let { prof_id, notice_body, title } = req.body;
  try {
    if (!prof_id || !notice_body || !admin || !title) {
      res
        .status(404)
        .json({ message: "Required fields are  Missing", success: false });
      return;
    } else {
      let prof = await ProfessorSchema.findById(prof_id);

      if (prof) {
        let notice = await NoticeSchema.create({
          prof_id: prof._id,
          prof_name: prof.fullName,
          notice_body,
          notice_title: title,
        });

        if (notice) {
          let info = await MailSender(
            prof.email,
            title,
            `${notice_body}`,
            `<h3>${title}</h3>
            <br>
            <p>${notice_body}</p>`
          );
          if (info) {
            notice = await NoticeSchema.findByIdAndUpdate(notice._id, {
              is_Sent: true,
            });
            let intro = prof.gender === "male" ? "Mr." : "Ms.";
            res.status(201).json({
              message: `Notice sent Succesfully to ${intro} ${prof.fullName}`,
              success: true,
            });
            return;
          } else {
            notice = await NoticeSchema.findByIdAndDelete(notice._id);
            res.status(500).json({
              message:
                "Sorry Currently we can't send Notice to Professor because of E-mail failure",
              success: false,
            });
            return;
          }
        } else {
          res.status(500).json({
            message: "Sorry Currently we can't send Notice to Professor",
            success: false,
          });
          return;
        }
      } else {
        res
          .status(404)
          .json({ message: "Professor not Found", success: false });
        return;
      }
    }
  } catch (error) {
    ErrorHandler(req, res, error);
  }
};
