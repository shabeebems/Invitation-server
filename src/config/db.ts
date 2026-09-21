import path from "path";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export async function connectDB(): Promise<void> {
  const uri =
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/invitation";

  mongoose.set("strictQuery", true);

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 15000,
  });

  console.log("MongoDB connected");
}
