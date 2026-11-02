import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/lib/auth";

/**
 * Verify admin session from cookie. Returns JWT payload if valid, otherwise null.
 */
export async function requireAdmin(request) {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifyAdminToken(token);
}

