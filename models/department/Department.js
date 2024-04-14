import mongoose from "mongoose";

const Department = mongoose.Schema({
  name: { type: String, required: true },
  semesters: [
    {
      name: { type: String },
      id: { type: mongoose.Schema.Types.ObjectId, ref: "Semester" },
    },
  ],
});

const DepartmentSchema = mongoose.model("Department", Department);
export default DepartmentSchema;
