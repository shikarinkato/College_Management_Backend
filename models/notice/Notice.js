import mongoose from "mongoose";

const Notice = mongoose.Schema({
  prof_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  prof_name: { type: String, required: true },
  notice_body: { type: String, required: true },
  notice_title: { type: String, required: true },
  notice_date: { type: Date, required: true, default: Date.now() },
  is_Sent: { type: Boolean, default: false },
});

const NoticeSchema = mongoose.model("Notice", Notice);

export default NoticeSchema;
