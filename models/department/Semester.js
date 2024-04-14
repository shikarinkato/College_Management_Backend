import mongoose from "mongoose";

const Semester = mongoose.Schema({
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Department",
  },
  semester: { type: String, required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
  
});

const SemesterSchema = mongoose.model("Semester", Semester);

export default SemesterSchema;
