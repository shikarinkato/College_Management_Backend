import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { ErrorHandler } from "../../middlewares/ErrorHandler.js";
import ProfessorSchema from "../../models/professor/Professor.js";

export const getProfProfile = async (req, res) => {
  let { emailOrMobileNumber, password } = req.body;
  try {
    if (!emailOrMobileNumber || !password) {
      res
        .status(404)
        .json({ message: "Required fields are Missing", success: false });
      return;
    } else {
      let prof;

      if (typeof emailOrMobileNumber === "string") {
        prof = await ProfessorSchema.findOne({
          email: emailOrMobileNumber,
        });
      } else if (typeof emailOrMobileNumber === "number") {
        prof = await ProfessorSchema.findOne({
          mobile_no: emailOrMobileNumber,
        });
      } else {
        res.status(400).json({
          message: "Please Provide an Valid type of ID for Login",
          success: false,
        });
        return;
      }
      if (prof) {
        let isMatchedPass = await bcryptjs.compare(password, prof.password);
        console.log(isMatchedPass);
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
          message: "There's no Professor with specific  Details",
          success: false,
        });
      }
    }
  } catch (error) {
    console.log(error);
    ErrorHandler(req, res, error);
  }
};
