import mongoose, { mongo } from "mongoose";

const Event = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
      minLength: 50,
      message: "Description Should Be More Than of 50 Characters ",
    },
    department: {
      name: { type: String, required: true },
      depID: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    },
    semester: {
      name: { type: String, required: true },
      semID: { type: mongoose.Schema.Types.ObjectId, ref: "Semester" },
    },
    event_date: {
      type: String,
    },
    isBroadcasted: { type: Boolean, default: false },
  },
  { timeStamp: true }
);

const EventSchema = mongoose.model("Event", Event);
export default EventSchema;
