import mongoose from "mongoose";

const Address = mongoose.Schema({
  category: { type: String, required: true },
  studentId_or_teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  house_no: { type: Number, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postal_code: {
    type: Number,
    required: true,
    minLength: 6,
    message: "Postal code must have 6 Digits",
  },
});

const AddressSchema = mongoose.model("Address", Address);

export default AddressSchema;
