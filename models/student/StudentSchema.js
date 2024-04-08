import mongoose from "mongoose";

const Student = mongoose.Schema({
  firstName: { type: String, required: true },
  lasName: { type: String, required: true },
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
  dob: { type: Date, required: true },
  religion: { type: String, required: true },
  martial_status: { type: String, required: true },
  blood_group: { type: String, required: true },
  national_id: { type: String, required: true },
  national_id_number: { type: String, required: true },
  admission_date: {
    type: Date,
    required: true,
  },
  current_address: { type: mongoose.Schema.Types.ObjectId, ref: "Address" },
  education: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Education", default: null },
  ],
  documents: {
    pic: { type: String, required: true },
    signature_img: { type: String, required: true },
    marksheet_10th: { type: String, required: true },
    marksheet_12th: { type: String, required: true },
    bachelor_marksheet: { type: String, default: null },
  },
});

const StudentSchema = mongoose.model("Student", Student);
export default StudentSchema;
