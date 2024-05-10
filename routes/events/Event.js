import express from "express";
import {
  //   BroadcastEvent,
  GetAllEvents,
  GetDepmntEvents,
  GetSemstrEvents,
} from "../../controller/professor/Event.js";
import { AdminAuthHandler } from "../../middlewares/AdminAuth.js";
import { EventAuthHandler } from "../../middlewares/EventAuthHandler.js";

const router = express.Router();

// get Requests
router.get("/all_events", AdminAuthHandler, GetAllEvents);
router.get("/department_events", GetDepmntEvents);
router.get("/semester_events", GetSemstrEvents);

// put Requests

// router.put(
//   "/department_events/broadcast/:evntID",
//   EventAuthHandler,
//   BroadcastEvent
// );

export default router;
