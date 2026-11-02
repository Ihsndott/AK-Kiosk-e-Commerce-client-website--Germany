import { NextResponse } from "next/server";
import { jwtVerify } from "jose/jwt/verify";
import { FEATURES } from "./lib/features.js";

const getAdminSecretKey = () => {
  const secret =
    process.env.ADMIN_JWT_SECRET ||
    "ak-kiosk-asian-market-super-secure-admin-session-secret-2026-xyz";
  return new TextEncoder().encode(secret);
};

const getCustomerSecretKey = () => {
  const secret =
    process.env.CUSTOMER_JWT_SECRET ||
    "ak-kiosk-customer-session-secure-secret-key-2026-prod-xyz987";
  return new TextEncoder().encode(secret);
};

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // When customer authentication is temporarily hidden, redirect direct visits to /login and /register to home
  if (!FEATURES.ENABLE_CUSTOMER_AUTH && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");
  const isAccountPage = pathname.startsWith("/account");
  const isAccountApi = pathname.startsWith("/api/account");

  // 1. Customer account route protection
  if (isAccountPage || isAccountApi) {
    const customerToken = request.cookies.get("ak_customer_session")?.value;
    let isCustomerAuth = false;

    if (customerToken) {
      try {
        await jwtVerify(customerToken, getCustomerSecretKey());
        isCustomerAuth = true;
      } catch {
        isCustomerAuth = false;
      }
    }

    if (!isCustomerAuth) {
      if (isAccountApi) {
        return NextResponse.json(
          {
            success: false,
            message: "Authentication required to access account services.",
          },
          { status: 401 }
        );
      }

      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      const response = NextResponse.redirect(loginUrl);

      if (customerToken) {
        response.cookies.delete("ak_customer_session");
      }

      return response;
    }

    return NextResponse.next();
  }

  // 2. Administrator route protection
  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next();
  }

  const isLoginRoute =
    pathname === "/admin/login" || pathname === "/api/admin/login";

  const sessionToken = request.cookies.get("ak_admin_session")?.value;

  // Check validity of existing admin token if present
  let isAuthenticated = false;
  if (sessionToken) {
    try {
      await jwtVerify(sessionToken, getAdminSecretKey());
      isAuthenticated = true;
    } catch {
      isAuthenticated = false;
    }
  }

  // If already authenticated and accessing admin login page, redirect to dashboard
  if (isLoginRoute) {
    if (isAuthenticated && pathname === "/admin/login") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // If unauthenticated and trying to access protected admin resources
  if (!isAuthenticated) {
    if (isAdminApi) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Administrator authentication required.",
        },
        { status: 401 }
      );
    }

    const loginUrl = new URL("/admin/login", request.url);
    if (pathname !== "/admin" && pathname !== "/admin/dashboard") {
      loginUrl.searchParams.set("from", pathname);
    }
    const response = NextResponse.redirect(loginUrl);

    // Clean up stale invalid cookie if present
    if (sessionToken) {
      response.cookies.delete("ak_admin_session");
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/account/:path*",
    "/api/account/:path*",
  ],
};
