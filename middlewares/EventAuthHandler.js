import ProfessorSchema from "../models/professor/Professor.js";
import { ErrorHandler } from "./ErrorHandler.js";
import jwt from "jsonwebtoken";

export const EventAuthHandler = async (req, res, next) => {
  let token = req.headers.authorization || req.headers.Authorization;
  try {
    if (token) {
      let trmToken = token.split(" ")[1];
      if (trmToken) {
        let vrfdToken = jwt.verify(trmToken, process.env.PROFESSOR_SECRET_KEY);
        if (vrfdToken) {
          let prof = await ProfessorSchema.findById(vrfdToken.id);
          let isHOD = prof.position === "Head of Department(HOD)";
          if (isHOD) {
            req.hod = prof;
            next();
          } else {
            res.status(400).json({
              message: "You're not Head of Any Department(HOD) ",
              success: false,
            });
          }
        } else {
          res
            .status(401)
            .json({ message: "Invalid Token can't Verify", success: false });
        }
      } else {
        res.status(403).json({ message: "Can't find Token", success: false });
      }
    } else {
      res.status(404).json({ message: "Token is Missing", success: false });
    }
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      res.status(403).json({
        message: "Token is Expired Please Login Again",
        success: false,
      });
    } else {
      ErrorHandler(req, res, error);
    }
  }
};
