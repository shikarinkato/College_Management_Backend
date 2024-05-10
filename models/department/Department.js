import mongoose from "mongoose";

const Department = mongoose.Schema({
  name: { type: String, required: true },
  semesters: [
    {
      name: { type: String },
      id: { type: mongoose.Schema.Types.ObjectId, ref: "Semester" },
    },
  ],
  events: [
    {
      evnt_name: { type: String },
      evntID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
      },
    },
  ],
});

const DepartmentSchema = mongoose.model("Department", Department);
export default DepartmentSchema;
