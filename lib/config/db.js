import mongoose from "mongoose";
import { env } from "../config/env.js";


export const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGO_DB_CONNECTION_URL);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};  
