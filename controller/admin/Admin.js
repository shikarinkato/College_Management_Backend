import Bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import otpGntr from "otp-generator";
import { ErrorHandler } from "../../middlewares/ErrorHandler.js";
import AdminSchema from "../../models/admin/Admin.js";
import OtpSchema from "../../models/otp/OTP.js";

export const AdminOTP = async (req, res, next) => {
  let { email } = req.body;
  try {
    if (!email) {
      res
        .status(404)
        .json({ message: "Required fields are Missing", success: false });
      return;
    } else {
      let admin = await AdminSchema.findOne({ email });

      if (admin) {
        res.status(400).json({
          message: "Admin already Exist with This Email. Please Login Again",
          success: false,
        });
      } else {
        let generatedOTP = await GenerateOTP(5, email);

        if (generatedOTP && email) {
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
            res.status(200).json({
              message: "OTP Send Successfully Kindly Check your email",
              success: true,
            });
            return;
          }
        } else {
          res.status(500).json({
            message: "Failed send OTP .Please Re-generate it",
            success: false,
          });
          return;
        }
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
            message: "OTP Verified Succesfully",
            success: true,
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
                    subject: "Warm Welcome to Our New College Admin!",
                    text: `Dear ${firstName + " " + lastName},

                           Welcome to the team! We're thrilled to have you \n
                           on board as our new admin. Your expertise and experience \n
                           will undoubtedly be invaluable as we navigate our college's \n
                           journey ahead. If you need any assistance settling in or have \n
                           any questions, please don't hesitate to reach out. Looking\n
                           forward to working together!\n
                    
                           This your AdminID:- ${adminID}. It'll be used as Temporary Password when ever <br>
                           you try to  login.

                           We recommend you to Create a New Password for Security Concerns.


                    Best regards,
                    Dr. MPS Group Of Institutions, Agra`,
                    html: `<div>
                    <h1>Dear ${firstName + " " + lastName}</h1>
                    <p>
                       Welcome to the team! We're thrilled to have you on \n
                       board as our new admin. Your expertise and  experience \n
                       will undoubtedly be invaluable as we navigate our college's \n
                       journey ahead. If you need any assistance settling in or \n
                       have any questions, please don't hesitate to reach out. \n
                       Looking forward to working together!
                    </p>
                    <p> This your AdminID:- ${adminID}. It'll be used as Temporary Password when ever <br>
                        you try to  login. 
                    </p>
                    <br>
                    <p>
                        We recommend you to Create a New Password for Security Concerns.
                    </p>
                    <br>
                    <p>Best regards,<br>
                       Dr. MPS Group Instituitions, Agra</p>
                  </div>`,
                  });
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

export const admnLoginOTP = async (req, res) => {
  let { emailOrMobileNumber, password } = req.body;
  try {
    if (!emailOrMobileNumber || !password) {
      res.status(404).json({
        message: "Oops! Looks like we're missing some crucial info. Any ideas?",
        success: false,
      });
      return;
    } else {
      let adminAcnt;

      if (typeof emailOrMobileNumber === "string") {
        adminAcnt = await AdminSchema.findOne({
          email: emailOrMobileNumber,
        });
      } else if (typeof emailOrMobileNumber === "number") {
        adminAcnt = await AdminSchema.findOne({
          mobile_no: emailOrMobileNumber,
        });
      } else {
        res.status(400).json({
          message: "Please Provide an Valid type of ID for Login",
          success: false,
        });
        return;
      }
      if (adminAcnt) {
        let isMatchedPass = await Bcryptjs.compare(
          password,
          adminAcnt.password
        );
        if (isMatchedPass) {
          let generatedOTP = await GenerateOTP(5, adminAcnt.email);
          if (generatedOTP) {
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
              to: adminAcnt.email,
              subject: "Verify login ",
              text: `Kindly Enter This OTP to login \n 
                       Your Otp is: ${generatedOTP} \n 
                       Expires in 1 Minute.
                                Regards
                                   Dr.MPS Group Of Intituitions
                                   Agra`,
              html: `<div>
                     <p>Kindly Enter This OTP to login</p>
                      <p>Your Otp is: ${generatedOTP} \n Expires in 1 Minute. </p>
                      <p>Dr. MPS Group of Institutions, Agra</p>
                    </div>`,
            });
            if (info) {
              res.status(200).json({
                message: "OTP Send Successfully for Admin Login",
                success: true,
              });
            } else {
              res.status(400).json({
                message: "Failed! to Send Mail. Please Retry",
                success: false,
              });
            }
          } else {
            res.status(400).json({
              message: "Failed to Generate OTP ",
              success: false,
            });
          }
        } else {
          res.status(401).json({
            message: "Invalid Credentials",
            success: false,
          });
          return;
        }
      } else {
        res.status(400).json({
          message: "There's No admin account with provided info",
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

export const Login = async (req, res) => {
  let { otp, emailOrMobileNumber } = req.query;
  try {
    if (!otp || !emailOrMobileNumber) {
      res.status(404).json({
        message: "Oops! Looks like we're missing some crucial info. Any ideas?",
        success: false,
      });
      return;
    } else {
      otp = +otp;
      let currentTime = Date.now();
      let adminAcnt;

      if (typeof emailOrMobileNumber === "string") {
        adminAcnt = await AdminSchema.findOne({
          email: emailOrMobileNumber,
        });
      } else if (typeof emailOrMobileNumber === "number") {
        adminAcnt = await AdminSchema.findOne({
          mobile_no: emailOrMobileNumber,
        });
      } else {
        res.status(400).json({
          message: "Please Provide an Valid type of ID for Login",
          success: false,
        });
        return;
      }

      if (adminAcnt) {
        let ftdOTP = await OtpSchema.findOne({
          $and: [{ email: adminAcnt.email }, { otp }],
        });

        if (ftdOTP) {
          let isExpired = ftdOTP.expirationTime < currentTime;
          if (isExpired) {
            res.status(400).json({
              message: "OTP Expired!  Please Send it again",
              success: false,
            });
            return;
          } else {
            let token = jwt.sign(
              {
                adminToken: process.env.ADMIN_AUTHTOKEN,
                admin_id: adminAcnt._id,
              },
              process.env.ADMIN_SECRET_KEY,
              { expiresIn: "12h" }
            );

            if (token) {
              res.status(200).json({
                message: `Logged In Succesfully as Mr. ${adminAcnt.firstName}`,
                adminAcnt,
                token,
                success: true,
              });
              return;
            } else {
              res.status(403).json({
                message: `Failed to Login. Kindly Retry`,
                success: false,
              });
              return;
            }
          }
        } else {
          res.status(400).json({
            message: "Invalid OTP or May be Expired ",
            success: false,
          });
          return;
        }
      } else {
        res.status(400).json({
          message: "There's No admin account with provided info",
          success: false,
        });
      }
    }
  } catch (error) {
    console.log(error);
    ErrorHandler(req, res, error);
  }
};

export const UpdateAdminProfile = async (req, res) => {
  let {
    firstName,
    lastName,
    fatherName,
    gender,
    dob,
    religion,
    martial_status,
    national_id,
    national_id_number,
    joining_date,
    current_address,
    documents,
    qualifications,
    achievements,
  } = req.body;
  let { mobileNo } = req.params;
  try {
    if (
      !firstName ||
      !lastName ||
      !fatherName ||
      !gender ||
      !dob ||
      !religion ||
      !martial_status ||
      !national_id ||
      !national_id_number ||
      !joining_date ||
      !current_address ||
      !documents ||
      !qualifications ||
      !achievements ||
      !mobileNo
    ) {
      res.status(400).json({
        message: "OOP's I think we're Something Important Info.",
        success: false,
      });
      return;
    } else {
      let admin = await AdminSchema.findOne({ mobile_no: mobileNo });
      if (admin) {
        let updatedAdmin = await AdminSchema.findByIdAndUpdate(
          admin._id,
          {
            firstName,
            lastName,
            fatherName,
            gender,
            dob,
            religion,
            martial_status,
            national_id,
            national_id_number,
            joining_date,
            current_address,
            documents,
            qualifications,
            achievements,
          },
          { new: true }
        );
        if (updatedAdmin) {
          res.status(201).json({
            message: "Admin Profile Updated Succesfully",
            success: true,
          });
          return;
        } else {
          res.status(500).json({
            message: "Failed to Update Admin Profile",
            success: false,
          });
          return;
        }
      } else {
        res.status(401).json({
          message: "Unable To find Admin With Provided Info",
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

export const UpdateAdminPassword = async (req, res) => {
  let { oldPass, newPass } = req.body;
  let admin = req.admin;
  try {
    if (!oldPass || !newPass || !admin) {
      res.status(400).json({
        message: "Crucial Info. is Missing 😑",
        success: false,
      });
      return;
    } else {
      let isMatchedPass = Bcryptjs.compare(oldPass, admin.password);
      if (isMatchedPass) {
        if (admin) {
          let hashedPass = await Bcryptjs.hash(newPass, 12);
          if (hashedPass) {
            let updatedAdmin = await AdminSchema.findByIdAndUpdate(
              admin._id,
              {
                password: hashedPass,
              },
              { new: true }
            );
            if (updatedAdmin) {
              let sentEMail = MailSender(
                admin.email,
                "Admin Password Updated Succefully",
                `Dear  ${admin.firstName + " " + admin.lastName}

                    We wanted to inform you that your account password has been successfully updated. If you did not initiate this change, please contact our support team immediately.
                    
                    For security reasons, please ensure that your new password is strong and unique.
                    
                    Best regards,
                
                    DR.MPS Group Of Institutions 
                    Memorial College Of Business Studies,
                    Agra, 
                    Uttar Pradesh
                `,
                `<h5>Dear  ${admin.firstName + " " + admin.lastName}</h5>

                   <p>We wanted to inform you that your account password has been successfully updated. If you 
                      did not initiate this change, please contact our support team immediately.</p>
                
                   <p>For security reasons, please ensure that your new password is strong and unique.</p>
                
                   <p>Best regards,</p>
            
                  <p>DR.MPS Group Of Institutions</p>
                  <p>Memorial College Of Business Studies,</p>
                  <p>Agra,</p>
                  <p>Uttar Pradesh</p>
                `
              );
              if (sentEMail) {
                res.status(201).json({
                  message: "New Pass Updated Succefully, Kindly Login Again",
                  success: true,
                });
                return;
              } else {
                hashedPass = await Bcryptjs.hash(admin.adminID);
                updatedAdmin = await AdminSchema.findByIdAndUpdate(
                  admin._id,
                  {
                    password: hashedPass,
                  },
                  { new: true }
                );
                res.status(500).json({
                  message: "Failed To Send New Password Updation E-mail",
                  success: false,
                });
                return;
              }
            } else {
              hashedPass = await Bcryptjs.hash(admin.adminID);
              updatedAdmin = await AdminSchema.findByIdAndUpdate(
                admin._id,
                {
                  password: hashedPass,
                },
                { new: true }
              );
              res.status(500).json({
                message: "Sorry we're getting issue in Updating Your New Pass",
                success: false,
              });
              return;
            }
          } else {
            res.status(500).json({
              message:
                "Sorry currently we're having isssue in Creating Your New Pass",
              success: false,
            });
          }
        } else {
          res.status(404).json({
            message: "Can't find Admin Account You Have Provided",
            success: false,
          });
          return;
        }
      } else {
        res.status(400).json({
          message: "Old Password is incorrect ",
          success: false,
        });
      }
    }
  } catch (error) {
    console.log(error);
    ErrorHandler(req, res, error);
  }
};

export const admnLgnInfUpdtnOTP = async (req, res) => {
  let { email } = req.body;
  let admin = req.admin;
  try {
    if (!email) {
      res.status(400).json({
        message: "Crucial Info. is Missing 😑",
        success: false,
      });
      return;
    } else {
      let generatedOTP = await GenerateOTP(5, admin.email);
      if (generatedOTP) {
        let sentEmail = await MailSender(
          admin.email,
          "OTP To Verify Updation Requested",
          `Dear Admin,

          You have requested to update your account information. Your OTP for verification is: ${generatedOTP} . Please use this OTP to complete the verification process.
      
          Best regards,
          DR.MPS Group Of Institutions 
          Memorial College Of Business Studies,
          Agra, 
          Uttar Pradesh`,
          `<h5>Dear Admin,</h5>

            <p>You have requested to update your account information. Your OTP for verification is: ${generatedOTP}      
               Please use this OTP to complete the verification process.
               </p>
    
            <p>Best regards,</p>

            <p>DR.MPS Group Of Institutions </p>
            <p>Memorial College Of Business Studies,</p>
            <p>Agra, </p>
            <p>Uttar Pradesh</p>
          `
        );
        if (sentEmail) {
          res.status(200).json({
            message: "OTP sent Successfully",
            success: true,
          });
          return;
        } else {
          res.status(500).json({
            message: "Failed to send OTP. Please try again later.",
            success: false,
          });
          return;
        }
      } else {
        res.status(500).json({
          message: "Failed to generate OTP. Please try again later.",
          success: false,
        });
        return;
      }
    }
  } catch (error) {
    console.log(error);
    ErrorHandler(error);
  }
};

export const updateAdminLoginInfo = async (req, res) => {
  let { email, mobile_no, otp } = req.body;
  let admin = req.admin;
  try {
    if (!email || !mobile_no || !otp) {
      res
        .status(404)
        .json({ message: "Required fields are Missing", success: false });
      return;
    } else {
      otp = +otp;
      let currentTime = Date.now();
      let ftdOTP = await OtpSchema.findOne({
        $and: [{ email }, { otp }, { expirationTime: { $gt: currentTime } }],
      });
      if (ftdOTP) {
        let updatedAdmin = await AdminSchema.findByIdAndUpdate(admin._id, {
          email,
          mobile_no,
        });

        if (updatedAdmin) {
          res.status(201).json({
            message: "Info. Updated Successfully",
            success: true,
          });
          return;
        } else {
          updatedAdmin = await AdminSchema.findByIdAndUpdate(admin._id, {
            email: admin.email,
            mobile_no: admin.mobile_no,
          });
          res.status(500).json({
            message: "Sorry Currently we can't updated Your Info.",
            success: false,
          });
          return;
          F;
        }
      } else {
        res
          .status(400)
          .json({ message: "Invalid! OTP or May be Expired", success: false });
        return;
      }
    }
  } catch (error) {
    console.log(error);
    ErrorHandler(req, res, error);
  }
};

export async function GenerateOTP(length, email) {
  let generatedOTP = otpGntr.generate(length, {
    lowerCaseAlphabets: false,
    specialChars: false,
    upperCaseAlphabets: false,
  });

  let otp = await OtpSchema.findOne({
    $and: [{ otp: generatedOTP }, { email }],
  });

  while (otp) {
    generatedOTP = otpGntr.generate(length, {
      lowerCaseAlphabets: false,
      specialChars: false,
      upperCaseAlphabets: false,
    });
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

  return generatedOTP;
}

async function MailSender(receiverMail, title, textBody, htmlBody) {
  try {
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
      to: receiverMail,
      subject: title,
      text: textBody,
      html: htmlBody,
    });
    return info;
  } catch (error) {
    console.log(error);
    ErrorHandler(error);
  }
}

