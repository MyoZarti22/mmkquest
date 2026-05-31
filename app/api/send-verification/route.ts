// app/api/send-verification/route.ts
// POST /api/send-verification
// Generates a 6-digit code, saves to Firestore, sends to Gmail

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { sendVerificationEmail } from "@/lib/nodemailer";

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    // Generate code
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save to Firestore (key = email address)
    await adminDb.collection("verificationCodes").doc(email).set({
      code,
      expiresAt: expiresAt.toISOString(),
      used: false,
      createdAt: new Date().toISOString(),
    });

    // Send to Gmail
    await sendVerificationEmail(email, code, name);

    return NextResponse.json({ success: true, message: "Verification code sent to your email" });
  } catch (err: any) {
    console.error("send-verification error:", err);
    return NextResponse.json({ error: "Failed to send verification email" }, { status: 500 });
  }
}
