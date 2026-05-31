// middleware.ts
// Protects /dashboard — redirects to /auth if not logged in
// Uses Firebase session cookie (set by client after login)

import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only protect /dashboard routes
  if (pathname.startsWith("/dashboard")) {
    // Check for Firebase auth cookie
    // Firebase client SDK sets __session cookie on login
    const session = req.cookies.get("__session")?.value
                 || req.cookies.get("firebaseToken")?.value;

    if (!session) {
      const loginUrl = new URL("/auth", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect logged-in users away from /auth
  if (pathname === "/auth") {
    const session = req.cookies.get("__session")?.value
                 || req.cookies.get("firebaseToken")?.value;
    if (session) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth"],
};
