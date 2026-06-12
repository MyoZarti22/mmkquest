// app/api/notify/route.ts
// POST /api/notify
// Sends Gmail & Telegram notifications: budget_warning | transaction | xp_reward | streak

import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";
import {
  sendBudgetWarningEmail,
  sendTransactionEmail,
} from "@/lib/nodemailer";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// ─── Send Telegram message ────────────────────────────────────────────────────
async function sendTelegramMessage(chatId: string, text: string) {
  if (!BOT_TOKEN) return false;
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: "HTML",
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

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
        if (user.telegramChatId && prefs.budgetTelegram !== false) {
          await sendTelegramMessage(
            user.telegramChatId,
            `⚠️ <b>Budget Warning!</b>\n\n💸 Spent: <code>${data.spent.toLocaleString()} MMK</code>\n🎯 Goal: <code>${data.goal.toLocaleString()} MMK</code>\n🆘 Emergency: <code>${data.emergency.toLocaleString()} MMK</code>`
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
        if (user.telegramChatId && prefs.transactionTelegram !== false) {
          await sendTelegramMessage(
            user.telegramChatId,
            `💳 <b>Transaction</b>\n\n📝 ${data.txName}\n💰 <code>${data.amount.toLocaleString()} MMK</code>\n🏪 ${data.category}\n💼 ${data.wallet}`
          );
        }
        break;

      case "xp_reward":
        if (user.telegramChatId) {
          await sendTelegramMessage(
            user.telegramChatId,
            `⭐ <b>XP Reward!</b>\n\n+${data.xp} XP\n📊 Level ${data.level}`
          );
        }
        break;

      case "streak":
        if (user.telegramChatId) {
          await sendTelegramMessage(
            user.telegramChatId,
            `🔥 <b>Streak Milestone!</b>\n\n🎉 ${data.streak} day streak!\n💪 Keep it going!`
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
