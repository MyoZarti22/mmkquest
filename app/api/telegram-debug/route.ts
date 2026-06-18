// app/api/telegram-debug/route.ts
// Visit: https://mmkquest.vercel.app/api/telegram-debug

import { NextResponse } from "next/server";
import * as admin from "firebase-admin";

export async function GET() {
  const result: any = {};

  // 1. Raw env var check
  const projectId   = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey  = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  result.env = {
    projectId:   projectId   ? `✅ ${projectId}`                    : "❌ MISSING",
    clientEmail: clientEmail ? `✅ ${clientEmail}`                  : "❌ MISSING",
    privateKey:  privateKey  ? `✅ length=${privateKey.length}`     : "❌ MISSING",
    privateKeyStarts: privateKey ? privateKey.slice(0, 50)          : "MISSING",
    hasLiteralBackslashN: privateKey?.includes("\\n")  ?? false,
    hasRealNewline:       privateKey?.includes("\n")   ?? false,
    startsWithBegin:      privateKey?.includes("BEGIN") ?? false,
  };

  // 2. Try init
  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId:   projectId!,
          clientEmail: clientEmail!,
          privateKey:  privateKey!.replace(/\\n/g, "\n"),
        }),
      });
    }
    result.adminInit = "✅ success";
  } catch (e: any) {
    result.adminInit = `❌ ERROR: ${e.message}`;
    return NextResponse.json(result);
  }

  // 3. Try Firestore query
  try {
    const db   = admin.firestore();
    const snap = await db.collection("users").where("telegramChatId", "==", "922419446").limit(1).get();
    result.query = {
      status: "✅ success",
      found:  !snap.empty,
      user:   snap.empty ? null : { name: snap.docs[0].data().name, telegramChatId: snap.docs[0].data().telegramChatId },
    };
  } catch (e: any) {
    result.query = `❌ ERROR: ${e.message}`;
  }

  // 4. Try full scan
  try {
    const db      = admin.firestore();
    const allSnap = await db.collection("users").get();
    result.scan = {
      totalUsers: allSnap.size,
      usersWithTelegram: allSnap.docs
        .filter(d => d.data().telegramChatId)
        .map(d => ({
          name: d.data().name,
          telegramChatId: d.data().telegramChatId,
          type: typeof d.data().telegramChatId,
        })),
    };
  } catch (e: any) {
    result.scan = `❌ ERROR: ${e.message}`;
  }

  return NextResponse.json(result, { status: 200 });
}
