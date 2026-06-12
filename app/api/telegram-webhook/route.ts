// app/api/telegram-webhook/route.ts

import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;

// ─── Initialize Firebase Admin inline (no dependency on lib/firebase-admin) ───
function getAdminDb() {
  if (getApps().length === 0) {
    const projectId   = process.env.FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey  = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error(
        `Missing Firebase Admin env vars. Have: projectId=${!!projectId}, clientEmail=${!!clientEmail}, privateKey=${!!privateKey}`
      );
    }

    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  }
  return getFirestore();
}

// ─── Send a message back to Telegram ─────────────────────────────────────────
async function reply(chatId: number | string, text: string) {
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id:    chatId,
      text:       text,
      parse_mode: "HTML",
    }),
  });
  const data = await res.json();
  if (!data.ok) {
    console.error(`❌ Failed to send Telegram message to ${chatId}:`, data.description);
  }
  return data;
}

// ─── Find user in Firestore by telegramChatId ─────────────────────────────────
async function findUserByChatId(chatId: string) {
  try {
    const db = getAdminDb();

    // Try string match first
    let snap = await db
      .collection("users")
      .where("telegramChatId", "==", chatId)
      .limit(1)
      .get();

    // Fallback: try as number
    if (snap.empty) {
      const chatIdNum = Number(chatId);
      if (!isNaN(chatIdNum)) {
        snap = await db
          .collection("users")
          .where("telegramChatId", "==", chatIdNum)
          .limit(1)
          .get();
      }
    }

    if (snap.empty) {
      console.log(`[MMKQuest] No user found for chatId: ${chatId}`);
      return null;
    }

    const docSnap = snap.docs[0];
    console.log(`[MMKQuest] Found user ${docSnap.id} for chatId: ${chatId}`);
    return { uid: docSnap.id, ...docSnap.data() } as any;

  } catch (err: any) {
    console.error(`[MMKQuest] findUserByChatId ERROR:`, err.message);
    return null;
  }
}

// ─── Get current month transactions ──────────────────────────────────────────
async function getMonthTransactions(uid: string) {
  const now   = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  try {
    const db   = getAdminDb();
    const snap = await db
      .collection("transactions")
      .where("userId", "==", uid)
      .get();

    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as any))
      .filter((t: any) => t.timestamp >= start);
  } catch (err: any) {
    console.error(`[MMKQuest] getMonthTransactions ERROR:`, err.message);
    return [];
  }
}

// ─── Get wallet balances ──────────────────────────────────────────────────────
async function getWalletBalances(uid: string) {
  try {
    const db   = getAdminDb();
    const snap = await db.collection("walletBalances").doc(uid).get();
    return snap.exists ? snap.data() as Record<string, number> : {};
  } catch (err: any) {
    console.error(`[MMKQuest] getWalletBalances ERROR:`, err.message);
    return {};
  }
}

// ─── Webhook handler ──────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const msg  = body.message || body.edited_message;
    if (!msg) return NextResponse.json({ ok: true });

    const chatId = String(msg.chat.id);
    const text   = (msg.text || "").trim();
    const from   = msg.from?.first_name || "there";

    console.log(`[MMKQuest] "${text}" from chatId: ${chatId}`);

    // ── /start ────────────────────────────────────────────────────────────────
    if (text === "/start" || text.startsWith("/start ")) {
      await reply(chatId, `
👋 <b>Welcome to MMKQuest Bot, ${from}!</b>

Your Chat ID is: <code>${chatId}</code>

Copy this number and paste it in:
<b>MMKQuest App → Profile → Telegram → Chat ID field</b>

Once connected you'll get:
• 💸 Transaction alerts
• ⚠️ Budget warnings
• ⭐ XP reward updates
• 🔥 Streak reminders

<b>Available commands:</b>
/balance — Check wallet balances
/spent — Monthly spending summary
/budget — Budget progress
/xp — Your level and XP
/rank — Your saver rank
/help — Show all commands`);
      return NextResponse.json({ ok: true });
    }

    // ── Find the user ─────────────────────────────────────────────────────────
    const user = await findUserByChatId(chatId);

    if (!user) {
      await reply(chatId, `
❌ <b>Account not linked</b>

Your Chat ID <code>${chatId}</code> is not connected to any MMKQuest account.

Please:
1. Open MMKQuest App
2. Go to Profile → Telegram
3. Paste this Chat ID: <code>${chatId}</code>
4. Click Save

⚠️ Make sure you click <b>Save</b> after entering the Chat ID.`);
      return NextResponse.json({ ok: true });
    }

    // ── /help ─────────────────────────────────────────────────────────────────
    if (text === "/help") {
      await reply(chatId, `
🎮 <b>MMKQuest Bot Commands</b>

/balance — Wallet balances
/spent — This month's spending
/budget — Budget progress & zone
/xp — Your XP and level
/rank — Your saver rank & streak
/help — Show this message

Hi <b>${user.name}</b> 👋`);
      return NextResponse.json({ ok: true });
    }

    // ── /balance ──────────────────────────────────────────────────────────────
    if (text === "/balance") {
      const wallets = await getWalletBalances(user.uid);
      const NAMES: Record<string, string> = {
        kbzpay: "KBZ Pay", wavepay: "WavePay", cbpay: "CB Pay",
        uabpay: "UAB Pay", ayapay: "AYA Pay",  cash:   "Cash",
      };
      const total = Object.values(wallets).reduce((a: number, b: number) => a + b, 0);
      const lines = Object.entries(wallets)
        .filter(([, v]) => (v as number) > 0)
        .map(([k, v]) => `  • ${NAMES[k] || k}: <code>${(v as number).toLocaleString()} MMK</code>`)
        .join("\n");

      await reply(chatId, `
💳 <b>Wallet Balances — ${user.name}</b>

${lines || "  No balances set yet"}

💰 <b>Total: <code>${total.toLocaleString()} MMK</code></b>`);
      return NextResponse.json({ ok: true });
    }

    // ── /spent ────────────────────────────────────────────────────────────────
    if (text === "/spent") {
      const txs      = await getMonthTransactions(user.uid);
      const expenses = txs.filter((t: any) => t.type === "expense");
      const income   = txs.filter((t: any) => t.type === "income");
      const totalExp = expenses.reduce((s: number, t: any) => s + Math.abs(t.amount), 0);
      const totalInc = income.reduce((s: number, t: any) => s + t.amount, 0);

      const cats: Record<string, number> = {};
      expenses.forEach((t: any) => {
        cats[t.category] = (cats[t.category] || 0) + Math.abs(t.amount);
      });
      const catLines = Object.entries(cats)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 4)
        .map(([k, v]) => `  • ${k}: <code>${(v as number).toLocaleString()} MMK</code>`)
        .join("\n");

      const month = new Date().toLocaleString("default", { month: "long", year: "numeric" });
      await reply(chatId, `
📊 <b>Spending Summary — ${month}</b>

💸 Total Spent: <code>${totalExp.toLocaleString()} MMK</code>
💚 Total Income: <code>${totalInc.toLocaleString()} MMK</code>
📈 Net: <code>${(totalInc - totalExp).toLocaleString()} MMK</code>

<b>Top Categories:</b>
${catLines || "  No expenses yet"}

Total transactions: ${txs.length}`);
      return NextResponse.json({ ok: true });
    }

    // ── /budget ───────────────────────────────────────────────────────────────
    if (text === "/budget") {
      const txs   = await getMonthTransactions(user.uid);
      const spent = txs.filter((t: any) => t.type === "expense")
        .reduce((s: number, t: any) => s + Math.abs(t.amount), 0);
      const goal  = user.goalBudget     || 175000;
      const emerg = user.emergencyLimit || 225000;
      const pct   = Math.round((spent / goal) * 100);
      const zone  = spent <= goal ? "✅ Perfect Save" : spent <= emerg ? "⚠️ Safe Zone" : "🚨 Exceeded";
      const xpEst = spent <= goal ? 100 + Math.floor((goal - spent) / 1000) * 5 : spent <= emerg ? 40 : 0;

      const barLen = 20;
      const filled = Math.min(Math.round((spent / emerg) * barLen), barLen);
      const bar    = "█".repeat(filled) + "░".repeat(barLen - filled);

      await reply(chatId, `
🎯 <b>Budget Progress</b>

<code>${bar}</code> ${pct}%

💸 Spent:     <code>${spent.toLocaleString()} MMK</code>
🎯 Goal:      <code>${goal.toLocaleString()} MMK</code>
🆘 Emergency: <code>${emerg.toLocaleString()} MMK</code>

Status: <b>${zone}</b>
Projected XP: <b>+${xpEst} XP</b>`);
      return NextResponse.json({ ok: true });
    }

    // ── /xp ───────────────────────────────────────────────────────────────────
    if (text === "/xp") {
      const lvl    = user.level || 1;
      const xp     = user.xp    || 0;
      const xpCurr = xp % 100;
      const filled = Math.round((xpCurr / 100) * 20);
      const bar    = "█".repeat(filled) + "░".repeat(20 - filled);

      await reply(chatId, `
⭐ <b>XP & Level — ${user.name}</b>

🎮 Level: <b>${lvl}</b>
⚡ Total XP: <code>${xp}</code>

Progress to Level ${lvl + 1}:
<code>${bar}</code> ${xpCurr}/100

${100 - xpCurr} XP needed to level up!`);
      return NextResponse.json({ ok: true });
    }

    // ── /rank ─────────────────────────────────────────────────────────────────
    if (text === "/rank") {
      const RANKS  = ["Bronze I","Bronze II","Silver I","Silver II","Gold I","Gold II","Gold III","Platinum I","Diamond I"];
      const rank   = user.rank   || "Bronze I";
      const streak = user.streak || 0;
      const idx    = RANKS.indexOf(rank);
      const next   = RANKS[idx + 1] || "MAX RANK";

      await reply(chatId, `
🏆 <b>Saver Rank — ${user.name}</b>

🎖 Current Rank: <b>${rank}</b>
🔥 Streak: <b>${streak} days</b>
⬆️ Next Rank: ${next}

${rank.includes("Diamond") ? "💎 DIAMOND — you're the best!" : rank.includes("Platinum") ? "💎 Platinum tier — amazing work!" : rank.includes("Gold") ? "💛 Gold tier! Keep saving!" : "Keep going to reach Gold tier!"}`);
      return NextResponse.json({ ok: true });
    }

    // ── Unknown command ───────────────────────────────────────────────────────
    if (text.startsWith("/")) {
      await reply(chatId, `❓ Unknown command: <code>${text}</code>\n\nType /help to see available commands.`);
      return NextResponse.json({ ok: true });
    }

    // ── Regular message ───────────────────────────────────────────────────────
    await reply(chatId, `Hi ${from}! 👋 I only understand commands.\n\nType /help to see what I can do.`);
    return NextResponse.json({ ok: true });

  } catch (error: any) {
    console.error("[MMKQuest] Webhook top-level error:", error.message);
    return NextResponse.json({ ok: true });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, message: "MMKQuest Telegram Webhook is active" });
}
