// app/api/telegram/route.ts
// Sends messages via Telegram Bot API
// Add TELEGRAM_BOT_TOKEN to .env.local

import { NextRequest, NextResponse } from "next/server";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// ─── Send a message to a Telegram chat ────────────────────────────────────────
async function sendTelegramMessage(chatId: string, text: string) {
  if (!BOT_TOKEN) throw new Error("TELEGRAM_BOT_TOKEN not set in .env.local");

  const res = await fetch(
    `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
    {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id:    chatId,
        text,
        parse_mode: "HTML",
      }),
    }
  );

  const data = await res.json();
  if (!data.ok) throw new Error(data.description || "Telegram API error");
  return data;
}

// ─── POST /api/telegram ───────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { chatId, type, data } = body;

    if (!chatId) {
      return NextResponse.json({ error: "chatId is required" }, { status: 400 });
    }

    let message = "";

    switch (type) {
      case "budget_warning":
        const pct = Math.round((data.spent / data.goal) * 100);
        const status = data.spent > data.emergency
          ? "🚨 DANGER — Budget Exceeded!"
          : data.spent > data.goal
          ? "⚠️ Warning — Above Goal"
          : "📊 Budget Update";
        message = `
<b>MMKQuest — ${status}</b>

💰 Spent: <code>${data.spent.toLocaleString()} MMK</code>
🎯 Goal: <code>${data.goal.toLocaleString()} MMK</code>
🆘 Emergency: <code>${data.emergency.toLocaleString()} MMK</code>
📈 Progress: <b>${pct}%</b>

${data.spent > data.emergency
  ? "❌ You exceeded your emergency limit. Recovery mode active."
  : data.spent > data.goal
  ? "⚡ You are above goal but below emergency limit. Stay focused!"
  : "✅ You are tracking well this month."}`;
        break;

      case "transaction":
        const isExpense = data.amount < 0;
        message = `
<b>MMKQuest — ${isExpense ? "💸 Expense" : "💚 Income"} Logged</b>

${isExpense ? "➖" : "➕"} <b>${data.txName}</b>
💵 Amount: <code>${Math.abs(data.amount).toLocaleString()} MMK</code>
💳 Wallet: ${data.wallet}
🏷 Category: ${data.category}`;
        break;

      case "xp_reward":
        message = `
<b>MMKQuest — ⭐ XP Earned!</b>

🎮 You earned <b>+${data.xp} XP</b>
📊 Total XP: <code>${data.totalXp}</code>
🏆 Rank: ${data.rank}

${data.xp >= 100 ? "🎉 Perfect Save this month! Keep it up!" : "👍 Good work! Aim for a Perfect Save next time."}`;
        break;

      case "streak":
        message = `
<b>MMKQuest — 🔥 Streak Alert</b>

Your ${data.streak}-day streak is at risk!
Log in and add your expenses today to keep your streak alive.

⚡ Current streak: <b>${data.streak} days</b>`;
        break;

      case "test":
        message = `
<b>MMKQuest Bot Connected! ✅</b>

Your Telegram notifications are now active.
You will receive:
• 💸 Transaction alerts
• ⚠️ Budget warnings  
• ⭐ XP reward updates
• 🔥 Streak reminders

<i>MMKQuest — Myanmar's Finance RPG</i>`;
        break;

      default:
        message = `<b>MMKQuest</b>\n\n${data?.message || "Notification from MMKQuest"}`;
    }

    await sendTelegramMessage(chatId, message.trim());
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Telegram API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send Telegram message" },
      { status: 500 }
    );
  }
}
