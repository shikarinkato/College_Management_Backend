import express from "express";
import { EventPush } from "../../controller/professor/Event.js";
import { EventAuthHandler } from "../../middlewares/EventAuthHandler.js";

const router = express.Router();

router.post("/add_event", EventAuthHandler, EventPush);

export default router;
