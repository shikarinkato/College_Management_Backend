import StudentSchema from "../models/student/StudentSchema.js";
import { ErrorHandler } from "./ErrorHandler.js";
import jwt from "jsonwebtoken";

export const StudentAuth = async (req, res, next) => {
  let token = req.headers.authorization || req.headers.Authorization;
  try {
    if (token) {
      let trmToken = await token.split(" ")[1];
      if (trmToken) {
        try {
          let verifiedToken = jwt.verify(
            trmToken,
            process.env.STUDENT_LOGIN_SECRET_KEY
          );
          if (verifiedToken) {
            let student = await StudentSchema.findById(verifiedToken.id);
            if (student) {
              req.student = student;
              next();
            } else {
              res.status(404).json({
                message: "Can't Verify Student with This Token",
                success: false,
              });
              return;
            }
          } else {
            res.status(401).json({
              message: "Token is Invalid",
              success: false,
            });
            return;
          }
        } catch (err) {
          if (err.name === "TokenExpiredError") {
            res.status(401).json({
              message: "Token has expired Please Log in Again",
              success: false,
            });
          } else {
            throw new Error(err);
          }
        }
      } else {
        res.status(403).json({
          message: "Token is Missing",
          success: false,
        });
        return;
      }
    } else {
      res.status(404).json({
        message: "Verification Token not Found",
        success: false,
      });
      return;
    }
  } catch (error) {
    // console.log(error.name);
    ErrorHandler(req, res, error);
  }
};
