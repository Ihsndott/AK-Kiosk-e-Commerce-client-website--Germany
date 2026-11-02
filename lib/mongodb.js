import mongoose from "mongoose";
import dns from "dns";

// Fix for Node.js SRV DNS resolution failure on Windows.
// Node.js uses a different DNS path than the OS; forcing ipv4first
// resolves querySrv ECONNREFUSED errors with mongodb+srv:// URIs.
dns.setDefaultResultOrder("ipv4first");

/**
 * Global cache across hot reloads in Next.js development.
 * This prevents creating multiple connection pools on every request.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  // Read env var inside the function so it is evaluated at call time,
  // not at module import time (important for Next.js hot-reload safety).
  const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!MONGODB_URI) {
    throw new Error(
      "Please define the MONGODB_URI or MONGO_URI environment variable inside .env.local"
    );
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName: process.env.MONGODB_DB || "akkiosk",
    };

    // Safe diagnostic: log scheme and host only — never logs credentials or full URI
    try {
      const url = new URL(MONGODB_URI);
      console.log("[AK Kiosk DB] Connecting to host:", url.hostname, "| scheme:", url.protocol);
    } catch {
      console.log("[AK Kiosk DB] URI scheme:", MONGODB_URI.split("://")[0] || "unknown");
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log("[AK Kiosk DB] Connected successfully to MongoDB Atlas");
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default connectToDatabase;
