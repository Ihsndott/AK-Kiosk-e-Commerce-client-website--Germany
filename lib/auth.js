import { SignJWT } from "jose/jwt/sign";
import { jwtVerify } from "jose/jwt/verify";
import bcrypt from "bcryptjs";
import connectToDatabase from "./mongodb.js";
import Admin from "../models/Admin.js";

export const ADMIN_COOKIE_NAME = "ak_admin_session";

// Secret key for signing admin JWT sessions
const getSecretKey = () => {
  const secret =
    process.env.ADMIN_JWT_SECRET ||
    "ak-kiosk-asian-market-super-secure-admin-session-secret-2026-xyz";
  return new TextEncoder().encode(secret);
};

/**
 * Creates a signed JWT session token for an authenticated administrator.
 */
export async function createAdminToken(payload, rememberMe = false) {
  const expiresIn = rememberMe ? "7d" : "24h";
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecretKey());
}

/**
 * Verifies a signed JWT session token.
 * Returns payload if valid, or null if expired/tampered.
 */
export async function verifyAdminToken(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload;
  } catch {
    return null;
  }
}

/**
 * Hashes a plaintext password with bcrypt (salt rounds = 12).
 */
export async function hashPassword(plainPassword) {
  return await bcrypt.hash(plainPassword, 12);
}

/**
 * Compares plaintext password against stored bcrypt hash.
 */
export async function comparePassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Ensures initial administrator account exists in MongoDB Atlas.
 * Reads credentials from environment variables (ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME).
 * If no admin exists in the database yet, securely hashes password and creates the initial record.
 * Once created, existing credentials in MongoDB are never automatically overwritten,
 * allowing the client to manage their credentials through Admin Profile.
 */
export async function ensureInitialAdmin() {
  await connectToDatabase();

  // Check if any admin already exists in the database
  const existingAdminCount = await Admin.countDocuments();
  if (existingAdminCount > 0) {
    // Administrator already exists. Never overwrite custom client credentials automatically.
    return null;
  }

  const envEmail = process.env.ADMIN_EMAIL;
  const envPassword = process.env.ADMIN_PASSWORD;

  if (!envEmail || !envPassword) {
    return null;
  }

  const normalizedEmail = envEmail.toLowerCase().trim();
  const hashedPassword = await hashPassword(envPassword);
  const admin = await Admin.create({
    email: normalizedEmail,
    password: hashedPassword,
    name: process.env.ADMIN_NAME || "Store Administrator",
    role: "superadmin",
  });
  return admin;
}

