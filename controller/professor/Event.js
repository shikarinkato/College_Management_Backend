import nodemailer from "nodemailer";
import { ErrorHandler } from "../../middlewares/ErrorHandler.js";
import DepartmentSchema from "../../models/department/Department.js";
import SemesterSchema from "../../models/department/Semester.js";
import EventSchema from "../../models/event/Event.js";
import StudentSchema from "../../models/student/StudentSchema.js";

// for HOD of Specific Department
export const EventPush = async (req, res) => {
  let hod = req.hod || req.admin;
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
      let splittedDate = event_date
        .split("-")
        .map((i) => Number(i))
        .reverse();

      event_date = new Date(
        splittedDate[0],
        splittedDate[1] - 1,
        splittedDate[2]
      );

      event_date = new Date(event_date);
      // console.log(event_date);
      event_date = event_date.toISOString();

      let isCrctHOD = req.hod ? hod.departments[0].name === department : true;
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
                      events: { evnt_name: evnt.title, evntID: evnt._id },
                    },
                  });
                  if (dep) {
                    let sem = await SemesterSchema.findByIdAndUpdate(
                      fndSem.id,
                      {
                        $push: {
                          events: { evnt_name: evnt.title, evnt_id: evnt._id },
                        },
                      }
                    );
                    if (sem) {
                      res.status(201).json({
                        message: "Event Created Succefully",
                        success: false,
                      });
                      return;
                    } else {
                      evnt = await EventSchema.findByAndDelete(evnt._id);
                      dep = await DepartmentSchema.findByIdAndUpdate(dep._id, {
                        $pull: {
                          events: { evnt_name: evnt.title, evntID: evnt._id },
                        },
                      });
                      sem = await SemesterSchema.findByIdAndUpdate(sem._id, {
                        $pull: {
                          events: { evnt_name: evnt.title, evnt_iD: evnt._id },
                        },
                      });
                      res.status(500).json({
                        message:
                          "Sorry we can't create Event Currently Due to Can't Push events into Semester",
                        success: false,
                      });
                      return;
                    }
                  } else {
                    evnt = await EventSchema.findByAndDelete(evnt._id);
                    dep = await DepartmentSchema.findByIdAndUpdate(dep._id, {
                      $pull: {
                        events: { evnt_name: evnt.name, evntID: evnt._id },
                      },
                    });
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

// Not Implemented Properly Yet
export const BroadcastEvent = async (req, res) => {
  let hod = req.hod || req.admin;
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
            if (evnt.isBroadcasted === true) {
              res.status(400).json({
                message: "Message already Sent To Everyone",
                success: false,
              });
            } else {
              let students = [];
              Promise.all(
                sem.students.map(async (stud) => {
                  let student = await StudentSchema.findById(stud);
                  if (student) {
                    let msg = await MessageMail(
                      student.email,
                      evnt.title,
                      evnt.description,
                      `<div>${evnt.description}</div>`
                    );
                    if (msg.accepted.length > 0) {
                      students.push(student._id);
                    }
                  }
                  return students;
                })
              )
                .then(async (resp) => {
                  evnt = await EventSchema.findByIdAndUpdate(evnt._id, {
                    isBroadcasted: true,
                  });
                  if (evnt) {
                    res.status(201).json({
                      message: "Message Sent To Everyone",
                      success: true,
                    });
                    return;
                  } else {
                    res.status(500).json({
                      message: "Failed To Sent Message Everyone",
                      success: true,
                    });
                    return;
                  }
                })
                .catch((err) => {
                  // console.log(err);
                  res.status(500).json({
                    message:
                      "Currently we're having issue in Sending Messages Everyone",
                    reason: err.message,
                    success: false,
                  });
                  return;
                });
            }
          } else {
            res.status(400).json({
              message: "Unable to find Any Semester with Provided ID",
              success: false,
            });
            return;
          }
        } else {
          res.status(400).json({
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

const MessageMail = async (rcvr_email, title, text_body, html_body) => {
  try {
    if (!rcvr_email || !title || !text_body || !html_body) {
      return res.status(404).json({
        message: "OOP's You're Missing Something Crucial",
        success: false,
      });
    } else {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
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
      return info;
    }
  } catch (error) {
    return error;
  }
};
