import { NextResponse } from "next/server";
import { clearCustomerCookie } from "@/lib/customerAuth";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/logout
 *
 * Terminates customer session by clearing the HTTP-only cookie.
 */
export async function POST() {
  const response = NextResponse.json(
    {
      success: true,
      message: "Customer session terminated successfully.",
    },
    { status: 200 }
  );

  clearCustomerCookie(response);

  return response;
}

