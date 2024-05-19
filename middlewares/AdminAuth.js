import jwt from "jsonwebtoken";
import { ErrorHandler } from "./ErrorHandler.js";
import AdminSchema from "../models/admin/Admin.js";

export const AdminAuthHandler = async (req, res, next) => {
  let token = req.headers.authorization || req.headers.Authorization;
  try {
    if (token) {
      token = token.split(" ")[1];
      if (token) {
        let verifiedToken = jwt.verify(token, process.env.ADMIN_SECRET_KEY);
        if (!verifiedToken) {
          res.status(403).json({
            message: "Unable To Verify ",
            success: false,
          });
        } else {
          if (verifiedToken.adminToken === process.env.ADMIN_AUTHTOKEN) {
            let admin = await AdminSchema.findById(verifiedToken.admin_id);
            if (admin) {
              req.admin = admin;
              next();
            }
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
    console.log(error);
    ErrorHandler(req, res, error);
  }
};
