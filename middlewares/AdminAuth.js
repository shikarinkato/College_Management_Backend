import jwt from "jsonwebtoken";
import { ErrorHandler } from "./ErrorHandler.js";

export const AuthHandler = async (req, res, next) => {
  let token = req.headers.authorization || req.headers.Authorization;
  try {
    if (token) {
      token = token.split(" ")[1];
      if (token) {
        let verifiedToken = jwt.decode(token, process.env.SECRET_KEY);
        if (!verifiedToken) {
          res.status(403).json({
            message: "Unable To Verify ",
            success: false,
          });
        } else {
          if (verifiedToken === process.env.ADMIN_AUTHTOKEN) {
            next();
          } else {
            res.status(403).json({ message: "Invalid Token", success: false });
          }
        }
      } else {
        res.status(403).json({ message: "Token is Null", success: false });
      }
    } else {
      res.status(404).json({ message: "Token is Missing", success: false });
    }
  } catch (error) {
    // console.log(error);
    ErrorHandler(req, res, error);
  }
};
