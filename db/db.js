import mongoose from "mongoose";

export const connectToMongo = async () => {
  await mongoose
    .connect(process.env.DATABASE_URL, {
      dbName: "College_Management_System",
    })
    .then((res) => {
      console.log("SuccesFully connected to Database", res.connection.host);
    })
    .catch((err) => {
      console.log("Failed to connect Database" + err);
    });
};
