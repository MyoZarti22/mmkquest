// scripts/setup-telegram-webhook.js
// Run this ONCE after deploying to Vercel:
// node scripts/setup-telegram-webhook.js

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const APP_URL   = process.env.NEXT_PUBLIC_APP_URL; // e.g. https://mmkquest.vercel.app

if (!BOT_TOKEN) {
  console.error("❌ TELEGRAM_BOT_TOKEN not set");
  console.error("Run: TELEGRAM_BOT_TOKEN=8944537699:AAHBPOSYY8Lw2-2ZVOwtEIdySFkSFrhY4xg NEXT_PUBLIC_APP_URL=https://mmkquest.vercel.app node scripts/setup-telegram-webhook.js");
  process.exit(1);
}

if (!APP_URL || APP_URL.includes("localhost")) {
  console.error("❌ APP_URL must be your live Vercel URL, not localhost");
  console.error("Telegram cannot reach localhost. Deploy to Vercel first.");
  console.error("Then set NEXT_PUBLIC_APP_URL=https://mmkquest.vercel.app");
  process.exit(1);
}

const WEBHOOK_URL = `${APP_URL}/api/telegram-webhook`;

async function setup() {
  console.log("Setting up Telegram webhook...");
  console.log("Bot Token:", BOT_TOKEN.slice(0, 10) + "...");
  console.log("Webhook URL:", WEBHOOK_URL);

  // 1. Get bot info
  const infoRes  = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`);
  const infoData = await infoRes.json();
  if (!infoData.ok) {
    console.error("❌ Invalid bot token:", infoData.description);
    process.exit(1);
  }
  console.log("✅ Bot:", "@" + infoData.result.username, "—", infoData.result.first_name);

  // 2. Set webhook
  const res  = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url:             WEBHOOK_URL,
      allowed_updates: ["message"],
    }),
  });
  const data = await res.json();

  if (data.ok) {
    console.log("✅ Webhook registered successfully!");
    console.log("   URL:", WEBHOOK_URL);
    console.log("");
    console.log("Test it: open Telegram, send /start to @" + infoData.result.username);
  } else {
    console.error("❌ Failed:", data.description);
  }

  // 3. Set bot commands menu
  const cmdRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setMyCommands`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      commands: [
        { command: "balance", description: "Check wallet balances" },
        { command: "spent",   description: "Monthly spending summary" },
        { command: "budget",  description: "Budget progress and zone" },
        { command: "xp",      description: "Your XP and level" },
        { command: "rank",    description: "Your saver rank and streak" },
        { command: "help",    description: "Show all commands" },
      ],
    }),
  });
  const cmdData = await cmdRes.json();
  if (cmdData.ok) {
    console.log("✅ Bot command menu set — users will see commands in the menu button");
  }
}

setup().catch(console.error);
