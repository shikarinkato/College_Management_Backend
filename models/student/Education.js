import mongoose from "mongoose";

const Education = mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  school_or_college: { type: String, required: true },
  passing_year: { type: Number, required: true },
  medium: { type: String, required: true },
  total_marks: { type: Number, required: true },
});

const EducationSchema = mongoose.model("Education", Education);

export default EducationSchema;
