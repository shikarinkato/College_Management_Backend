import { config } from "dotenv";
import express from "express";

config({ path: "./db/config.env" });

export const app = express();


app.get("/", (req, res) => {
  res.send("Hii lavdya");
});
