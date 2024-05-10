import { ErrorHandler } from "../../middlewares/ErrorHandler.js";
import ProfessorSchema from "../../models/professor/Professor.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

export const getProfProfile = async (req, res) => {
  let { mobile_no, password } = req.body;
  try {
    if (!mobile_no || !password) {
      res
        .status(404)
        .json({ message: "Required fields are Missing", success: false });
      return;
    } else {
      let prof = await ProfessorSchema.findOne({ mobile_no });
      if (prof) {
        let isMatchedPass = await bcryptjs.compare(password, prof.password);
        if (isMatchedPass) {
          const token = jwt.sign(
            { id: prof._id },
            process.env.PROFESSOR_SECRET_KEY,
            { expiresIn: 60 * 60 * 12 }
          );
          if (token) {
            res.status(404).json({
              message: "Professor profile Fetched Succesfully",
              professor: prof,
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
          message: "There's no Professor with specific Mobile Number",
          success: false,
        });
      }
    }
  } catch (error) {
    console.log(error);
    ErrorHandler(req, res, error);
  }
};
