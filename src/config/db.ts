import path from "path";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

/** Avoid 10s mongoose command buffering when the DB is down (hangs SSR / Suspense). */
mongoose.set("bufferCommands", false);
mongoose.set("strictQuery", true);

export function isDbReady(): boolean {
  return mongoose.connection.readyState === 1;
}

export async function connectDB(): Promise<void> {
  const uri =
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/invitation";

  if (isDbReady()) {
    return;
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 8000,
  });

  console.log("MongoDB connected");
}

/** Keep retrying in dev so a flaky Atlas start does not leave the API permanently offline. */
export function startDbReconnectLoop(intervalMs = 15_000): void {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  const tick = async () => {
    if (isDbReady()) {
      return;
    }

    try {
      await connectDB();
    } catch (error) {
      console.warn(
        "MongoDB reconnect failed:",
        error instanceof Error ? error.message : error
      );
    }
  };

  void tick();
  setInterval(() => {
    void tick();
  }, intervalMs);
}
