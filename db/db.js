import mongoose from "mongoose";

export const connectToMongo = () => {
  mongoose
    .connect(process.env.DATABASE_URL, {
      dbName: "Collge Management System",
    })
    .then(() => {
      console.log("SuccesFully connected to Database");
    })
    .catch((err) => {
      console.log("Failed to connect Database" + err);
    });
};
