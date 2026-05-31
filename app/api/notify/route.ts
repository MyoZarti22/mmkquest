// app/api/notify/route.ts
// POST /api/notify
// Sends Gmail notifications: budget_warning | transaction | xp_reward | streak

import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";
import {
  sendBudgetWarningEmail,
  sendTransactionEmail,
} from "@/lib/nodemailer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, userId, data } = body;

    if (!type || !userId) {
      return NextResponse.json({ error: "type and userId required" }, { status: 400 });
    }

    // Get user from Firestore
    const userDoc = await adminDb.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const user = userDoc.data()!;

    // Check user's notification preferences
    const prefs = user.notificationPrefs || {};

    // Save notification to Firestore regardless
    await adminDb.collection("notifications").add({
      userId,
      type,
      message: data.message || "",
      read: false,
      createdAt: new Date().toISOString(),
    });

    // Send email based on type
    switch (type) {
      case "budget_warning":
        if (prefs.budgetEmail !== false) {
          await sendBudgetWarningEmail(
            user.email,
            user.name,
            data.spent,
            data.goal,
            data.emergency
          );
        }
        break;

      case "transaction":
        if (prefs.transactionEmail !== false) {
          await sendTransactionEmail(
            user.email,
            user.name,
            data.txName,
            data.amount,
            data.wallet,
            data.category
          );
        }
        break;

      default:
        // Other notification types saved to Firestore only
        break;
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("notify error:", err);
    return NextResponse.json({ error: "Notification failed" }, { status: 500 });
  }
}
