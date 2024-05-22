import DepartmentSchema from "../../models/department/Department.js";
import SemesterSchema from "../../models/department/Semester.js";
import EventSchema from "../../models/event/Event.js";

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
      let dep = await DepartmentSchema.findOne({ name: depName });
      if (dep) {
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
            message: `0 Events Found for Department ${depName}`,
            success: false,
          });
          return;
        }
      } else {
        res.status(400).json({
          message: "There's no Department With This Name",
          success: false,
        });
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
      let sem = await SemesterSchema.findOne({ semester: semName });
      if (sem) {
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
            message: `0 Events Found for ${semName}`,
            success: false,
          });
          return;
        }
      } else {
        res.status(404).json({
          message: "Can't find any Semester With this Name",
          success: false,
        });
      }
    }
  } catch (error) {
    // console.log(error);
    ErrorHandler(req, res, error);
  }
};
