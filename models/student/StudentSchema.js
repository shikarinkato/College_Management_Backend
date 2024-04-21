import mongoose from "mongoose";

const Student = mongoose.Schema(
  {
    studentID: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    fatherName: { type: String, required: true },
    motherName: { type: String, required: true },
    mobile_no: { type: Number, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },
    gender: {
      type: String,
      required: true,
      enum: ["male", "female", "other", "prefer not to say"],
    },
    dob: { type: String, required: true },
    religion: { type: String, required: true },
    martial_status: { type: String, required: true },
    blood_group: { type: String, required: true },
    national_id: {
      type: String,
      required: true,
      enum: ["Adhar Card", "Pan Card", "Driving License"],
      message: "Please of the reuired National ID",
    },
    national_id_number: {
      type: Number,
      required: true,
      validate: {
        validator: function (value) {
          if (this.national_id === "Adhar Card") {
            return value.toString().length === 12 ? true : false;
          } else if (this.national_id === "Pan Card") {
            return value.toString().length === 10 ? true : false;
          } else if (this.national_id === "Driving License") {
            return value.toString().length >= 10 &&
              value.toString().length <= 20
              ? true
              : false;
          } else {
            return true;
          }
        },
        message: function () {
          return `Please provide valid National ID Number for specific ID (check Length of provided Input)`;
        },
      },
    },
    addmission_date: {
      type: String,
      required: true,
    },
    current_address: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      default: null,
    },
    education: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Education", default: null },
    ],
    enrollment_no: { type: Number, required: true },
    documents: {
      pic: { type: String, required: true },
      signature_img: { type: String, required: true },
      marksheet_10th: { type: String, required: true },
      marksheet_12th: { type: String, required: true },
      bachelor_marksheet: { type: String, default: null },
    },
    department: {
      name: { type: String, default: null },
      id: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    },
    results: [{ semester: { type: String }, resultLink: { type: String } }],
    achievements: [
      {
        name: { type: String },
        achieveDesc: { type: String },
        digitalLink: { type: String },
      },
    ],
    fees: [
      {
        semester: {
          name: { type: String },
          id: { type: mongoose.Schema.Types.ObjectId, ref: "Semester" },
        },
        fee: {
          total_fee: { type: Number },
          due_fee: { type: Number },
          submited_fee: { type: Number },
        },
      },
    ],
    semester: {
      name: { type: String },
      id: { type: mongoose.Schema.Types.ObjectId, ref: "Semester" },
    },
    password: { type: String, required: true },
  },
  { timestamp: true }
);

const StudentSchema = mongoose.model("Student", Student);
export default StudentSchema;
