import mongoose from "mongoose";

export const connectDatabase = () => {
  let DB_URI = "";

  if (process.env.NODE_ENV === "DEVELOPMENT") DB_URI = process.env.DB_LOCAL_URI;
  if (process.env.NODE_ENV === "PRODUCTION") DB_URI = process.env.DB_URI;

  mongoose.connect(DB_URI)
    .then((con) => {
      console.log(
        `MongoDB Database connected with HOST: ${con?.connection?.host}`
      );
    })
    .catch((error) => {
      console.log("Database connection failed:", error.message);
      process.exit(1); // Exit the process with failure
    });
};