import { ErrorHandler } from "../../middlewares/ErrorHandler.js";
import DepartmentSchema from "../../models/department/Department.js";
import SemesterSchema from "../../models/department/Semester.js";
import EventSchema from "../../models/event/Event.js";
import StudentSchema from "../../models/student/StudentSchema.js";
import nodemailer from "nodemailer";

// for HOD of Specific Department
export const EventPush = async (req, res) => {
  let hod = req.hod;
  let { title, description, department, semester, event_date } = req.body;
  try {
    if (
      !hod ||
      !title ||
      !description ||
      !department ||
      !semester ||
      !event_date
    ) {
      res
        .status(404)
        .json({ message: "Required fields are Missing", success: false });
      return;
    } else {
      let isCrctHOD = hod.departments[0].name === department;
      if (isCrctHOD) {
        let dep = await DepartmentSchema.findOne({ name: department });

        if (dep) {
          let isSemIncld = dep.semesters.some((sem) => sem.name === semester);

          if (isSemIncld) {
            let fndIndex = dep.semesters.findIndex(
              (sem) => sem.name === semester
            );

            let fndSem = dep.semesters[fndIndex];

            let evnt = await EventSchema.findOne({ event_date });
            if (evnt) {
              res.status(400).json({
                message: "we're already Having An Event on This Date ",
                success: false,
              });
              return;
            } else {
              evnt = await EventSchema.findOne({
                $and: [
                  {
                    "semester.name": semester,
                  },
                  {
                    "department.name": department,
                  },
                  { title: title },
                  { event_date },
                ],
              });

              if (evnt) {
                res.status(400).json({
                  message: "Event already Created With Provided event Info.",
                  success: false,
                });
                return;
              } else {
                evnt = await EventSchema.create({
                  title,
                  description,
                  department: {
                    name: dep.name,
                    depID: dep._id,
                  },
                  semester: { name: fndSem.name, semID: fndSem.id },
                  event_date,
                });

                if (evnt) {
                  dep = await DepartmentSchema.findByIdAndUpdate(dep._id, {
                    $push: {
                      events: { evnt_name: evnt.name, evntID: evnt._id },
                    },
                  });
                  if (dep) {
                    res.status(201).json({
                      message: "Event Created Succefully",
                      success: false,
                    });
                    return;
                  } else {
                    res.status(500).json({
                      message:
                        "Sorry we can't create Event Currently Due to Can't Push events into Department",
                      success: false,
                    });
                    return;
                  }
                } else {
                  res.status(500).json({
                    message:
                      "Sorry currently we're facing Issue in Pushing Event",
                    success: false,
                  });
                  return;
                }
              }
            }
          } else {
            res.status(404).json({
              message: "Can't find Provided Semester",
              success: false,
            });
            return;
          }
        } else {
          res.status(404).json({
            message: "Can't find any Department with This Name",
            success: false,
          });
          return;
        }
      } else {
        res.status(403).json({
          message: `You're not Head Of Department(HOD) of ${department}`,
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


// Not completed Yet

/* 
export const BroadcastEvent = async (req, res) => {
  let hod = req.hod;
  let { evntID } = req.params;
  try {
    if (!hod || !evntID) {
      res.status(404).json({
        message: "I think we're Missing Something Crucial Info.",
        success: false,
      });
      return;
    } else {
      let evnt = await EventSchema.findById(evntID);
      if (evnt) {
        let isCrctHOD = hod.departments[0].name === evnt.department.name;
        if (isCrctHOD) {
          let sem = await SemesterSchema.findById(evnt.semester?.semID);
          if (sem) {
            let students = [];
            Promise.all(
              sem.students.map(async (stud) => {
                let student = await StudentSchema.findById(stud);
                if (student) {
                  console.log(student.email);
                  students.push(student);
                  return BroadcastMessage(
                    student.email,
                    evnt.title,
                    evnt.description,
                    `<div>${evnt.description}</div>`
                  );
                }
                return students;
              })
            )
              .then((resp) => {
                console.log(resp);
                res.status(201).json({
                  message: "Message Sent To Everyone",
                  success: true,
                });
                return;
              })
              .catch((err) => {
                // console.log(err);
                res.status(500).json({
                  message:
                    "Currently we're having issue in Sending Messages Everyone",
                  success: false,
                });
                return;
              });
          } else {
            res.status(400).json({
              message: "Unable to find Any Semester with Provided ID",
              success: false,
            });
            return;
          }
        } else {
          res.status(401).json({
            message: `You're not Head of Department(HOD) of this ${evnt.department.name}`,
            success: false,
          });
          return;
        }
      } else {
        res.status(404).json({
          message: "Can't find The Event with Provided ID",
          success: false,
        });
        return;
      }
    }
  } catch (error) {
    // console.log(error);
    ErrorHandler(req, res, error);
  }
};


const BroadcastMessage = async (rcvr_email, title, text_body, html_body) => {
  try {
    if (!rcvr_email || !title || !text_body || !html_body) {
      return res.status(404).json({
        message: "OOP's You're Missing Something Crucial",
        success: false,
      });
    } else {
      console.log(rcvr_email, html_body);
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
        from: `Dr. MPS Group Of Instituitions 👻" <${process.env.SENDER_EMAIL}>`,
        to: rcvr_email,
        subject: title,
        text: text_body,
        html: html_body,
      });
    }
  } catch (error) {
    return error;
  }
};
*/

// for Admin
export const GetAllEvents = async (req, res) => {
  try {
    let events = await EventSchema.find({});

    if (events.length > 0) {
      res.status(200).json({
        message: "All Events Fetched Succesfully",
        success: true,
        events,
      });
      return;
    } else {
      res.status(404).json({
        message: "0 Events Found",
        success: false,
      });
      return;
    }
  } catch (error) {
    // console.log(error);
    ErrorHandler(req, res, error);
  }
};

// for Everyone
export const GetDepmntEvents = async (req, res) => {
  let { depName } = req.query;
  try {
    if (!depName) {
      res.status(404).json({
        message: "OOP's I think We're Missing Something Important",
        success: false,
      });
    } else {
      let events = await EventSchema.find({
        "department.name": depName,
      });

      if (events.length > 0) {
        res.status(200).json({
          message: `Events of ${depName} Fetched Succesfully`,
          success: true,
          events,
        });
        return;
      } else {
        res.status(404).json({
          message: "0 Events Found",
          success: false,
        });
        return;
      }
    }
  } catch (error) {
    // console.log(error);
    ErrorHandler(req, res, error);
  }
};

export const GetSemstrEvents = async (req, res) => {
  let { semName } = req.query;
  try {
    if (!semName) {
      res.status(404).json({
        message: "Oop's I think We're Missing Something Important",
        success: false,
      });
    } else {
      let events = await EventSchema.find({
        "semester.name": semName,
      });

      if (events.length > 0) {
        res.status(200).json({
          message: `Events of ${semName} Semester Fetched Succesfully`,
          success: true,
          events,
        });
        return;
      } else {
        res.status(404).json({
          message: "0 Events Found",
          success: false,
        });
        return;
      }
    }
  } catch (error) {
    // console.log(error);
    ErrorHandler(req, res, error);
  }
};
