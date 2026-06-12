// app/api/telegram-debug/route.ts
// TEMPORARY DEBUG ENDPOINT — remove after fixing
// Visit: https://your-app.vercel.app/api/telegram-debug?chatId=922419446

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(req: NextRequest) {
  const chatId = req.nextUrl.searchParams.get("chatId") || "922419446";

  const result: any = {
    chatId,
    timestamp: new Date().toISOString(),
    steps: [],
  };

  // Step 1 — Check Firebase Admin is initialized
  try {
    result.steps.push({ step: "1_admin_init", status: "checking" });
    const testRef = adminDb.collection("users").limit(1);
    const testSnap = await testRef.get();
    result.steps[0].status = "ok";
    result.steps[0].totalUsers = testSnap.size;
  } catch (err: any) {
    result.steps[0].status = "ERROR";
    result.steps[0].error = err.message;
    result.steps[0].code  = err.code;
    return NextResponse.json(result, { status: 200 });
  }

  // Step 2 — Query by chatId as STRING
  try {
    result.steps.push({ step: "2_query_string", chatId, type: "string" });
    const snap = await adminDb
      .collection("users")
      .where("telegramChatId", "==", chatId)
      .limit(1)
      .get();
    result.steps[1].status  = "ok";
    result.steps[1].found   = !snap.empty;
    result.steps[1].docId   = snap.empty ? null : snap.docs[0].id;
    if (!snap.empty) {
      const d = snap.docs[0].data();
      result.steps[1].userData = {
        name: d.name,
        email: d.email,
        telegramChatId: d.telegramChatId,
        telegramChatIdType: typeof d.telegramChatId,
      };
    }
  } catch (err: any) {
    result.steps[1].status = "ERROR";
    result.steps[1].error  = err.message;
  }

  // Step 3 — Query by chatId as NUMBER
  try {
    result.steps.push({ step: "3_query_number", chatId: Number(chatId), type: "number" });
    const snap = await adminDb
      .collection("users")
      .where("telegramChatId", "==", Number(chatId))
      .limit(1)
      .get();
    result.steps[2].status = "ok";
    result.steps[2].found  = !snap.empty;
    result.steps[2].docId  = snap.empty ? null : snap.docs[0].id;
    if (!snap.empty) {
      const d = snap.docs[0].data();
      result.steps[2].userData = {
        name: d.name,
        email: d.email,
        telegramChatId: d.telegramChatId,
        telegramChatIdType: typeof d.telegramChatId,
      };
    }
  } catch (err: any) {
    result.steps[2].status = "ERROR";
    result.steps[2].error  = err.message;
  }

  // Step 4 — Scan ALL users and find matching telegramChatId manually
  try {
    result.steps.push({ step: "4_full_scan" });
    const allSnap = await adminDb.collection("users").get();
    result.steps[3].status     = "ok";
    result.steps[3].totalDocs  = allSnap.size;

    const matches: any[] = [];
    allSnap.docs.forEach((doc) => {
      const d = doc.data();
      if (d.telegramChatId !== undefined) {
        matches.push({
          uid: doc.id,
          telegramChatId: d.telegramChatId,
          telegramChatIdType: typeof d.telegramChatId,
          telegramChatIdStr: String(d.telegramChatId),
          isMatch: String(d.telegramChatId) === String(chatId),
          name: d.name,
        });
      }
    });
    result.steps[3].usersWithTelegramId = matches;
  } catch (err: any) {
    result.steps[3].status = "ERROR";
    result.steps[3].error  = err.message;
  }

  // Summary
  const stringFound = result.steps[1]?.found;
  const numberFound = result.steps[2]?.found;
  const scanMatch   = result.steps[3]?.usersWithTelegramId?.find((u: any) => u.isMatch);

  result.summary = {
    foundAsString:  stringFound,
    foundAsNumber:  numberFound,
    foundInScan:    !!scanMatch,
    scanMatchData:  scanMatch || null,
    diagnosis: stringFound || numberFound
      ? "✅ User found — webhook query should work"
      : scanMatch
        ? `⚠️ User exists in scan but WHERE query failed — possible Firestore index issue. Stored type: ${scanMatch.telegramChatIdType}`
        : "❌ No user found with this chatId anywhere in Firestore — chatId was not saved correctly",
  };

  return NextResponse.json(result, { status: 200 });
}
