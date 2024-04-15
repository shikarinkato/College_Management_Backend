import nodemailer from "nodemailer";
import otpGntr from "otp-generator";
import { ErrorHandler } from "../../middlewares/ErrorHandler.js";
import OtpSchema from "../../models/otp/OTP.js";
import AdminSchema from "../../models/admin/Admin.js";
import Bcryptjs from "bcryptjs";

export const AdminOTP = async (req, res, next) => {
  let { email } = req.body;
  try {
    if (!email) {
      res
        .status(404)
        .json({ message: "Required fields are Missing", success: false });
      return;
    } else {
      let generatedOTP = GenerateOTP();

      if (generatedOTP && email) {
        let otp = await OtpSchema.findOne({
          $and: [{ otp: generatedOTP }, { email }],
        });

        while (otp) {
          generatedOTP = GenerateOTP();
          otp = await OtpSchema.findOne({
            $and: [{ otp: generatedOTP }, { email }],
          });
        }

        let addTime = 60 * 1000;
        let expirationTime = Date.now() + addTime;
        otp = await OtpSchema.create({
          otp: generatedOTP,
          email,
          expirationTime,
        });

        if (otp) {
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
            to: email,
            subject: "OTP email to verify your Signup ",
            text: `This otp is to verify your email from \n Dr.MPS Group Of Intituitions, Agra\n
                   Your Otp is: ${generatedOTP} \n Expires in 1 Minute`,
            html: `<div>
                     <p>This otp is to verify your email from \n
                      Dr.MPS Group Of Intituitions, Agra</p>
                      <p>
                      Your Otp is: ${generatedOTP} \n Expires in 1 Minute
                      </p>
            </div>`,
          });
          if (info) {
            res.status(201).json({
              message: "OTP Send Successfully Kindly Check your email",
              success: true,
            });
            return;
          }
        } else {
          res.status(400).json({
            message: "Pls Re-generate OTP",
            success: false,
          });
          return;
        }
      } else {
        res.status(500).json({ message: "Failed send OTP", success: false });
        return;
      }
    }
  } catch (error) {
    console.log(error);
    ErrorHandler(req, res, error);
  }
};

export const VerfiyAdminOTP = async (req, res) => {
  let { otp, email } = req.query;
  try {
    if (!otp || !email) {
      res.status(404).json({
        message: "Oops! Looks like we're missing some crucial info. Any ideas?",
        success: false,
      });
      return;
    } else {
      +otp;
      let currentTime = Date.now();
      let ftdOTP = await OtpSchema.findOne({ $and: [{ otp }, { email }] });

      if (ftdOTP) {
        if (currentTime > ftdOTP.expirationTime) {
          res.status(400).json({
            message: "OTP Expired Kindly Send it Again",
            success: false,
          });
          return;
        } else {
          res.status(200).json({
            ftdOTP,
          });
          return;
        }
      } else {
        res.status(400).json({
          message: "Incorrect OTP or Maye be OTP got Expired",
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

export const CreateAdmin = async (req, res) => {
  let {
    firstName,
    lastName,
    fatherName,
    mobile_no,
    email,
    gender,
    dob,
    religion,
    martial_status,
    national_id,
    national_id_number,
    joining_date,
    current_address,
    qualifications,
    documents,
    achievements,
  } = req.body;
  try {
    if (
      !firstName ||
      !lastName ||
      !fatherName ||
      !mobile_no ||
      !email ||
      !gender ||
      !dob ||
      !religion ||
      !martial_status ||
      !national_id ||
      !national_id_number ||
      !joining_date ||
      !current_address ||
      !qualifications ||
      !documents ||
      !achievements
    ) {
      res.status(404).json({
        message: "Couldn't receive Provided Data Kindly Fill Details Again",
        success: false,
      });
      return;
    } else {
      let findAdmin = await AdminSchema.find({});
      if (findAdmin.length > 0) {
        res.status(403).json({
          message: "There can't be more Than One Admin",
          success: false,
        });
      } else {
        let admin = await AdminSchema.findOne({
          $and: [
            {
              mobile_no,
            },
            { email },
            {
              $and: [{ firstName }, { lastName }],
            },
            {
              $and: [{ national_id }, { national_id_number }],
            },
          ],
        }).select(
          "-fatherName -mobile_no -dob -national_id -national_id_number "
        );

        if (admin) {
          res.status(401).json({
            message: "Admin Already exists with Provided Details",
            success: false,
          });
        } else {
          let adminID = otpGntr.generate(8);
          let hashedPass = await Bcryptjs.hash(adminID, 8);

          admin = await AdminSchema.create({
            adminID,
            firstName,
            lastName,
            fatherName,
            mobile_no,
            email,
            gender,
            dob,
            religion,
            martial_status,
            national_id,
            national_id_number,
            joining_date,
            current_address,
            documents,
            achievements,
            password: hashedPass,
          });

          if (admin) {
            Promise.all(
              qualifications.map(async (qualification) => {
                let mdfyAdmin = await AdminSchema.findByIdAndUpdate(admin._id, {
                  $push: {
                    qualifications: {
                      admin_id: admin._id,
                      insitute_name: qualification.insitute_name,
                      qlfc_name: qualification.qlfc_name,
                      completion_year: qualification.completion_year,
                    },
                  },
                });
                return mdfyAdmin;
              })
            )
              .then(async (resp) => {
                admin = await AdminSchema.findByIdAndUpdate(admin._id, {
                  current_address: { admin_id: admin._id },
                });
                if (admin) {
                  res.status(201).json({
                    message: "Admin Account Created Succesfully",
                    admin,
                    success: true,
                  });
                } else {
                  admin = await AdminSchema.findByIdAndDelete(admin._id);
                  res.status(500).json({
                    message:
                      "Failed Create Admin account due to address allocation Issue",
                    success: false,
                  });
                }
              })
              .catch(async (err) => {
                admin = await AdminSchema.findByIdAndDelete(admin._id);
                throw new Error(err);
              });
          } else {
            res.status(500).json({
              message: "Failed to Create Admin account",
              success: false,
            });
          }
        }
      }
    }
  } catch (error) {
    console.log(error);
    ErrorHandler(req, res, error);
  }
};

function GenerateOTP() {
  let generatedOTP = otpGntr.generate(5, {
    lowerCaseAlphabets: false,
    specialChars: false,
    upperCaseAlphabets: false,
  });
  return generatedOTP;
}
