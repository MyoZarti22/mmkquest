// middleware.ts
// Disabled cookie check — Firebase Auth handles protection client-side
import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  // Just allow all requests through
  // Dashboard page protects itself via useAuth hook
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
