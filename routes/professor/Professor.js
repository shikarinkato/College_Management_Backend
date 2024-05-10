import express from "express";
import { getProfProfile } from "../../controller/professor/Professor.js";

const router = express.Router();

router.get("/profile", getProfProfile);

export default router;
