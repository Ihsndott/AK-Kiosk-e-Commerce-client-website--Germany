import { SignJWT } from "jose/jwt/sign";
import { jwtVerify } from "jose/jwt/verify";
import bcrypt from "bcryptjs";

export const CUSTOMER_COOKIE_NAME = "ak_customer_session";

// Distinct secret key for signing customer JWT sessions (separate from admin)
const getCustomerSecretKey = () => {
  const secret =
    process.env.CUSTOMER_JWT_SECRET ||
    "ak-kiosk-customer-session-secure-secret-key-2026-prod-xyz987";
  return new TextEncoder().encode(secret);
};

/**
 * Creates a signed JWT session token for an authenticated customer.
 * Token expires in 7 days (remember me) or 24 hours (standard session).
 */
export async function createCustomerToken(payload, rememberMe = false) {
  const expiresIn = rememberMe ? "7d" : "24h";
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getCustomerSecretKey());
}

/**
 * Verifies a customer signed JWT session token.
 * Returns payload if valid, or null if expired or tampered.
 */
export async function verifyCustomerToken(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getCustomerSecretKey());
    return payload;
  } catch {
    return null;
  }
}

/**
 * Extracts and verifies customer session from request cookies.
 */
export async function getCustomerFromRequest(request) {
  const token = request.cookies.get(CUSTOMER_COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifyCustomerToken(token);
}

/**
 * Hashes a plaintext customer password with bcrypt (12 rounds).
 */
export async function hashCustomerPassword(plainPassword) {
  return await bcrypt.hash(plainPassword, 12);
}

/**
 * Compares plaintext password against stored bcrypt hash.
 */
export async function compareCustomerPassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Sets secure HTTP-only customer session cookie on a NextResponse.
 */
export function setCustomerCookie(response, token, rememberMe = false) {
  const maxAge = rememberMe ? 60 * 60 * 24 * 7 : 60 * 60 * 24; // 7 days or 24 hours

  response.cookies.set({
    name: CUSTOMER_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });

  return response;
}

/**
 * Clears the customer session cookie on a NextResponse.
 */
export function clearCustomerCookie(response) {
  response.cookies.set({
    name: CUSTOMER_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });

  return response;
}

