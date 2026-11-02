import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();

    const readyState = mongoose.connection.readyState;
    // Mongoose readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    const isConnected = readyState === 1;

    if (isConnected) {
      return NextResponse.json(
        {
          status: "ok",
          message: "AK Kiosk API and MongoDB Atlas connection are operational",
          database: {
            status: "connected",
            name: mongoose.connection.name || "akkiosk",
            readyState,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        status: "degraded",
        message: "Database connection is not yet ready",
        database: {
          status: readyState === 2 ? "connecting" : "disconnected",
          readyState,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  } catch (error) {
    // Categorise the error without logging any secrets or credentials.
    const errMsg = error?.message || "";
    const errCode = String(error?.code || error?.codeName || "");

    let category = "UNKNOWN";
    if (
      errMsg.includes("ENOTFOUND") ||
      errMsg.includes("querySrv") ||
      errMsg.includes("getaddrinfo")
    ) {
      category = "DNS_RESOLUTION_FAILURE";
    } else if (
      errMsg.includes("Authentication failed") ||
      errMsg.includes("bad auth") ||
      errCode === "AuthenticationFailed" ||
      errMsg.includes("Unauthorized")
    ) {
      category = "AUTHENTICATION_FAILURE";
    } else if (
      errMsg.includes("whitelist") ||
      errMsg.includes("not allowed") ||
      errMsg.includes("ECONNREFUSED") ||
      errCode === "AtlasError"
    ) {
      category = "IP_ACCESS_RESTRICTION";
    } else if (
      errMsg.includes("ETIMEDOUT") ||
      errMsg.includes("timed out") ||
      errMsg.includes("MongoServerSelectionError")
    ) {
      category = "CONNECTION_TIMEOUT_OR_IP_BLOCK";
    } else if (
      errMsg.includes("Invalid connection string") ||
      errMsg.includes("invalid scheme") ||
      errMsg.includes("URI")
    ) {
      category = "INVALID_CONNECTION_STRING";
    } else if (!process.env.MONGODB_URI && !process.env.MONGO_URI) {
      category = "MISSING_ENV_VARIABLE";
    }

    // Safe server-side logging — never logs the URI or credentials
    console.error("[AK Kiosk DB] Error category:", category);
    console.error("[AK Kiosk DB] Error name:", error?.name);
    console.error("[AK Kiosk DB] Error code:", errCode || "none");
    // Safe: log message but strip anything that looks like a URI or credential
    const safeMsgPart = (error?.message || "").replace(/mongodb(\+srv)?:\/\/[^\s]*/gi, "[URI_REDACTED]");
    console.error("[AK Kiosk DB] Safe error message:", safeMsgPart);

    return NextResponse.json(
      {
        status: "error",
        message: "Unable to establish connection to MongoDB Atlas",
        database: {
          status: "disconnected",
          errorCategory: category,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}

