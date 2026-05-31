// app/api/verify-code/route.ts
// POST /api/verify-code
// Checks if the code matches and hasn't expired

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { sendWelcomeEmail } from "@/lib/nodemailer";

export async function POST(req: NextRequest) {
  try {
    const { email, code, name, isNewUser } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ error: "Email and code are required" }, { status: 400 });
    }

    // Get stored code from Firestore
    const doc = await adminDb.collection("verificationCodes").doc(email).get();

    if (!doc.exists) {
      return NextResponse.json({ error: "No verification code found. Please request a new one." }, { status: 404 });
    }

    const data = doc.data()!;

    // Check if already used
    if (data.used) {
      return NextResponse.json({ error: "This code has already been used." }, { status: 400 });
    }

    // Check expiry
    const expiresAt = new Date(data.expiresAt);
    if (new Date() > expiresAt) {
      return NextResponse.json({ error: "Code has expired. Please request a new one." }, { status: 400 });
    }

    // Check code matches
    if (data.code !== code.trim()) {
      return NextResponse.json({ error: "Incorrect code. Please try again." }, { status: 400 });
    }

    // Mark as used
    await adminDb.collection("verificationCodes").doc(email).update({ used: true });

    // Send welcome email only for new registrations
    if (isNewUser && name) {
      await sendWelcomeEmail(email, name);
    }

    return NextResponse.json({ success: true, message: "Email verified successfully" });
  } catch (err: any) {
    console.error("verify-code error:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
