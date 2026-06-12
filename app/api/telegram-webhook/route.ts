// app/api/telegram-debug/route.ts
// Visit: https://your-app.vercel.app/api/telegram-debug?chatId=922419446

import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

export async function GET(req: NextRequest) {
  const chatId = req.nextUrl.searchParams.get("chatId") || "922419446";
  const result: any = { chatId, steps: [] };

  // Step 1: Check env vars
  const projectId   = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey  = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  result.steps.push({
    step: "env_vars",
    FIREBASE_ADMIN_PROJECT_ID:   projectId   ? `✅ "${projectId}"` : "❌ MISSING",
    FIREBASE_ADMIN_CLIENT_EMAIL: clientEmail ? `✅ "${clientEmail?.slice(0,30)}..."` : "❌ MISSING",
    FIREBASE_ADMIN_PRIVATE_KEY:  privateKey  ? `✅ starts with: "${privateKey?.slice(0,40)}..."` : "❌ MISSING",
    PRIVATE_KEY_HAS_NEWLINES:    privateKey?.includes("\\n") ? "has \\n (needs replace)" : privateKey?.includes("\n") ? "has real newlines ✅" : "NO NEWLINES AT ALL ❌",
  });

  if (!projectId || !clientEmail || !privateKey) {
    result.diagnosis = "❌ MISSING ENV VARS — add them to Vercel";
    return NextResponse.json(result);
  }

  // Step 2: Init Firebase Admin
  try {
    if (getApps().length === 0) {
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, "\n"),
        }),
      });
    }
    result.steps.push({ step: "firebase_init", status: "✅ ok", appsCount: getApps().length });
  } catch (err: any) {
    result.steps.push({ step: "firebase_init", status: "❌ ERROR", error: err.message });
    result.diagnosis = "❌ Firebase Admin failed to init";
    return NextResponse.json(result);
  }

  // Step 3: Query Firestore
  try {
    const db   = getFirestore();
    const snap = await db.collection("users").where("telegramChatId", "==", chatId).limit(1).get();
    result.steps.push({
      step: "query_string",
      status: "✅ ok",
      found: !snap.empty,
      docId: snap.empty ? null : snap.docs[0].id,
      data: snap.empty ? null : {
        name: snap.docs[0].data().name,
        telegramChatId: snap.docs[0].data().telegramChatId,
        type: typeof snap.docs[0].data().telegramChatId,
      },
    });
  } catch (err: any) {
    result.steps.push({ step: "query_string", status: "❌ ERROR", error: err.message, code: err.code });
  }

  // Step 4: Scan all users
  try {
    const db      = getFirestore();
    const allSnap = await db.collection("users").get();
    const usersWithTg = allSnap.docs
      .filter(d => d.data().telegramChatId !== undefined)
      .map(d => ({
        uid: d.id,
        name: d.data().name,
        telegramChatId: d.data().telegramChatId,
        type: typeof d.data().telegramChatId,
        isMatch: String(d.data().telegramChatId) === String(chatId),
      }));
    result.steps.push({
      step: "scan_all_users",
      status: "✅ ok",
      totalUsers: allSnap.size,
      usersWithTelegram: usersWithTg,
    });
  } catch (err: any) {
    result.steps.push({ step: "scan_all_users", status: "❌ ERROR", error: err.message, code: err.code });
  }

  return NextResponse.json(result, { status: 200 });
}
