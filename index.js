import { config } from "dotenv";
import express from "express";
import jwt from "jsonwebtoken";
import AdminRouter from "./routes/admin/Admin.js";

config({ path: "./db/config.env" });
export const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hii lavdya");
});

app.use("/api/v1/admin", AdminRouter);
