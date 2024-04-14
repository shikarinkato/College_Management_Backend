import { ErrorHandler } from "../../middlewares/ErrorHandler.js";
import DepartmentSchema from "../../models/department/Department.js";
import SemesterSchema from "../../models/department/Semester.js";

export async function createSemester(req, res) {
  let { departmentName, semester } = req.body;
  try {
    if (!departmentName || !semester) {
      res.status(404).json({
        message: "Required fields are missing",
        success: "false",
      });
      return;
    } else {
      let department = await DepartmentSchema.find({ name: departmentName });
      if (department.length > 0) {
        let semesterInfo = await SemesterSchema.find({ semester });
        if (semesterInfo.length > 0) {
          res.status(200).json({
            message: "Semester Already Exists",
            semesterInfo,
            success: true,
          });
        } else {
          let departmentInfo = await DepartmentSchema.find({
            $and: [
              { name: departmentName },
              { semesters: { $elemMatch: { name: semester } } },
            ],
          });
          if (departmentInfo.length > 0) {
            let foundSemester;
            semesterInfo = departmentInfo.map((i) =>
              i.semesters.map((i) => {
                if (i.name === semester) {
                  foundSemester = i;
                  return 0;
                }
              })
            );
            res.status(201).json({
              message: "We already have this Semester",
              foundSemester,
              success: true,
            });
          } else {
            semesterInfo = await SemesterSchema.create({
              departmentId: department[0]._id,
              semester,
              students: [],
            });
            if (semesterInfo) {
              department = await DepartmentSchema.findByIdAndUpdate(
                department[0]._id,
                {
                  $push: {
                    semesters: {
                      name: semesterInfo.semester,
                      id: semesterInfo._id,
                    },
                  },
                }
              );
              res.status(201).json({
                message: "Semester Created Succesfully",
                semesterInfo,
                success: true,
              });
            } else {
              res.status(409).json({
                message: "Failed to Create Semester",
                success: false,
              });
            }
          }
        }
      } else {
        res.status(502).json({
          message:
            "Check weather we have that Department or not .If yes than create a new one",
          success: false,
        });
      }
    }
  } catch (error) {
    console.log(error);
    ErrorHandler(req, res, error);
    return;
  }
}
