// app/api/telegram-webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import * as admin from "firebase-admin";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;

// ── Init Firebase Admin (safe to call multiple times) ─────────────────────────
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

// ── Send Telegram message ─────────────────────────────────────────────────────
async function reply(chatId: string | number, text: string) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
}

// ── Find user by Telegram Chat ID ─────────────────────────────────────────────
async function findUser(chatId: string) {
  const db = getDb();

  // try string
  let snap = await db.collection("users").where("telegramChatId", "==", chatId).limit(1).get();
  if (!snap.empty) return { uid: snap.docs[0].id, ...snap.docs[0].data() } as any;

  // try number
  snap = await db.collection("users").where("telegramChatId", "==", Number(chatId)).limit(1).get();
  if (!snap.empty) return { uid: snap.docs[0].id, ...snap.docs[0].data() } as any;

  return null;
}

// ── Get this month's transactions ─────────────────────────────────────────────
async function getMonthTxs(uid: string) {
  const db    = getDb();
  const start = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const snap  = await db.collection("transactions").where("userId", "==", uid).get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as any)).filter((t: any) => t.timestamp >= start);
}

// ── Get wallet balances ───────────────────────────────────────────────────────
async function getWallets(uid: string) {
  const db   = getDb();
  const snap = await db.collection("walletBalances").doc(uid).get();
  return (snap.exists ? snap.data() : {}) as Record<string, number>;
}

// ── Webhook ───────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const msg  = body.message || body.edited_message;
    if (!msg) return NextResponse.json({ ok: true });

    const chatId = String(msg.chat.id);
    const text   = (msg.text || "").trim();
    const from   = msg.from?.first_name || "there";

    // /start — always works, no auth needed
    if (text === "/start" || text.startsWith("/start ")) {
      await reply(chatId, `👋 <b>Welcome to MMKQuest Bot, ${from}!</b>\n\nYour Chat ID is: <code>${chatId}</code>\n\nPaste this in:\n<b>MMKQuest App → Profile → Telegram → Chat ID field → Save</b>\n\n<b>Commands:</b>\n/balance — Wallet balances\n/spent — Monthly spending\n/budget — Budget progress\n/xp — Your XP and level\n/rank — Your rank\n/help — All commands`);
      return NextResponse.json({ ok: true });
    }

    // All other commands need a linked account
    const user = await findUser(chatId);

    if (!user) {
      await reply(chatId, `❌ <b>Account not linked</b>\n\nChat ID <code>${chatId}</code> is not connected.\n\n1. Open MMKQuest App\n2. Profile → Telegram tab\n3. Enter <code>${chatId}</code>\n4. Click <b>Save</b>`);
      return NextResponse.json({ ok: true });
    }

    if (text === "/help") {
      await reply(chatId, `🎮 <b>MMKQuest Commands</b>\n\n/balance — Wallet balances\n/spent — Monthly spending\n/budget — Budget progress & zone\n/xp — XP and level\n/rank — Saver rank & streak\n/help — This message\n\nHi <b>${user.name}</b> 👋`);
    }

    else if (text === "/balance") {
      const wallets = await getWallets(user.uid);
      const NAMES: Record<string, string> = { kbzpay:"KBZ Pay", wavepay:"WavePay", cbpay:"CB Pay", uabpay:"UAB Pay", ayapay:"AYA Pay", cash:"Cash" };
      const total = Object.values(wallets).reduce((a, b) => a + b, 0);
      const lines = Object.entries(wallets).filter(([,v]) => v > 0).map(([k,v]) => `  • ${NAMES[k]||k}: <code>${v.toLocaleString()} MMK</code>`).join("\n");
      await reply(chatId, `💳 <b>Wallets — ${user.name}</b>\n\n${lines || "  No balances set"}\n\n💰 <b>Total: <code>${total.toLocaleString()} MMK</code></b>`);
    }

    else if (text === "/spent") {
      const txs     = await getMonthTxs(user.uid);
      const exp     = txs.filter((t:any) => t.type==="expense").reduce((s:number,t:any)=>s+Math.abs(t.amount),0);
      const inc     = txs.filter((t:any) => t.type==="income").reduce((s:number,t:any)=>s+t.amount,0);
      const cats: Record<string,number> = {};
      txs.filter((t:any)=>t.type==="expense").forEach((t:any)=>{ cats[t.category]=(cats[t.category]||0)+Math.abs(t.amount); });
      const catLines = Object.entries(cats).sort(([,a],[,b])=>b-a).slice(0,4).map(([k,v])=>`  • ${k}: <code>${v.toLocaleString()} MMK</code>`).join("\n");
      const month = new Date().toLocaleString("default",{month:"long",year:"numeric"});
      await reply(chatId, `📊 <b>Spending — ${month}</b>\n\n💸 Spent: <code>${exp.toLocaleString()} MMK</code>\n💚 Income: <code>${inc.toLocaleString()} MMK</code>\n📈 Net: <code>${(inc-exp).toLocaleString()} MMK</code>\n\n<b>Top Categories:</b>\n${catLines||"  No expenses yet"}\n\nTransactions: ${txs.length}`);
    }

    else if (text === "/budget") {
      const txs   = await getMonthTxs(user.uid);
      const spent = txs.filter((t:any)=>t.type==="expense").reduce((s:number,t:any)=>s+Math.abs(t.amount),0);
      const goal  = user.goalBudget||175000;
      const emerg = user.emergencyLimit||225000;
      const pct   = Math.round((spent/goal)*100);
      const zone  = spent<=goal ? "✅ Perfect Save" : spent<=emerg ? "⚠️ Safe Zone" : "🚨 Exceeded";
      const xpEst = spent<=goal ? 100+Math.floor((goal-spent)/1000)*5 : spent<=emerg ? 40 : 0;
      const filled = Math.min(Math.round((spent/emerg)*20),20);
      const bar   = "█".repeat(filled)+"░".repeat(20-filled);
      await reply(chatId, `🎯 <b>Budget Progress</b>\n\n<code>${bar}</code> ${pct}%\n\n💸 Spent: <code>${spent.toLocaleString()} MMK</code>\n🎯 Goal: <code>${goal.toLocaleString()} MMK</code>\n🆘 Emergency: <code>${emerg.toLocaleString()} MMK</code>\n\nStatus: <b>${zone}</b>\nProjected XP: <b>+${xpEst} XP</b>`);
    }

    else if (text === "/xp") {
      const lvl  = user.level||1;
      const xp   = user.xp||0;
      const curr = xp%100;
      const bar  = "█".repeat(Math.round((curr/100)*20))+"░".repeat(20-Math.round((curr/100)*20));
      await reply(chatId, `⭐ <b>XP & Level — ${user.name}</b>\n\n🎮 Level: <b>${lvl}</b>\n⚡ Total XP: <code>${xp}</code>\n\nProgress:\n<code>${bar}</code> ${curr}/100\n\n${100-curr} XP to Level ${lvl+1}!`);
    }

    else if (text === "/rank") {
      const RANKS = ["Bronze I","Bronze II","Silver I","Silver II","Gold I","Gold II","Gold III","Platinum I","Diamond I"];
      const rank  = user.rank||"Bronze I";
      const next  = RANKS[RANKS.indexOf(rank)+1]||"MAX RANK";
      await reply(chatId, `🏆 <b>Rank — ${user.name}</b>\n\n🎖 Rank: <b>${rank}</b>\n🔥 Streak: <b>${user.streak||0} days</b>\n⬆️ Next: ${next}`);
    }

    else if (text.startsWith("/")) {
      await reply(chatId, `❓ Unknown command: <code>${text}</code>\n\nType /help to see all commands.`);
    }

    else {
      await reply(chatId, `Hi ${from}! 👋 I only understand commands.\n\nType /help to see what I can do.`);
    }

  } catch (err: any) {
    console.error("[webhook error]", err.message);
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ ok: true, message: "MMKQuest Webhook active" });
}
