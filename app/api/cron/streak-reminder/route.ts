// app/api/cron/streak-reminder/route.ts
// Runs every day at 08:00 UTC (2:30 PM Myanmar Time)

import { NextRequest, NextResponse } from "next/server";
import * as admin from "firebase-admin";

function getDb() {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId:   process.env.FIREBASE_ADMIN_PROJECT_ID!,
        privateKey:  process.env.FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, "\n"),
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
      }),
    });
  }
  return admin.firestore();
}

async function sendTelegram(chatId: string, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN!;
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
  return res.json();
}

export async function GET(req: NextRequest) {
  // Only Vercel cron or requests with the secret can trigger this
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db   = getDb();
    const snap = await db.collection("users").get();

    let sent    = 0;
    let skipped = 0;

    for (const doc of snap.docs) {
      const user = doc.data();

      if (!user.telegramChatId) { skipped++; continue; }
      if (user.notifs?.streak === false) { skipped++; continue; }

      const streak = user.streak || 0;
      const name   = user.name   || "there";

      let message = "";
      if (streak === 0) {
        message = `⚡ <b>Hey ${name}!</b>\n\nYou don't have a streak yet — today is a great day to start! 🌟\n\nLog an expense in MMKQuest and begin your savings journey.\n\n💡 Even logging 100 MMK counts!`;
      } else if (streak === 1) {
        message = `🔥 <b>1-day streak, ${name}!</b>\n\nYou started — now keep it going! Log today's expenses to build your streak.\n\n🎯 Goal: Stay below your budget this month for +100 XP!`;
      } else if (streak < 7) {
        message = `🔥 <b>${streak}-day streak!</b>\n\nNice work, ${name}! Don't break it now.\n\nLog your expenses today to keep your streak alive 💪\n\n⭐ You're ${7 - streak} days away from the <b>7-Day Streak</b> achievement!`;
      } else if (streak < 30) {
        message = `🔥 <b>${streak}-day streak!</b>\n\nYou're on fire, ${name}! 🌟\n\nLog your expenses today to keep your streak alive.\n\n🏆 ${30 - streak} days to the <b>30-Day Legend</b> achievement!`;
      } else {
        message = `👑 <b>${streak}-day streak, ${name}!</b>\n\nLEGENDARY! You've been consistent for ${streak} days straight! 🏆\n\nLog today's expenses to maintain your legendary status!`;
      }

      await sendTelegram(String(user.telegramChatId), message);
      sent++;
    }

    return NextResponse.json({ ok: true, sent, skipped });

  } catch (err: any) {
    console.error("[streak-reminder] ERROR:", err.message);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
