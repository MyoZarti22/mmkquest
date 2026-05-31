// lib/firebase-admin.ts
// Firebase ADMIN — used only in API routes (server side)
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId:   process.env.FIREBASE_ADMIN_PROJECT_ID!,
      privateKey:  process.env.FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, "\n"),
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
    }),
  });
}

export const adminDb   = admin.firestore();
export const adminAuth = admin.auth();
export default admin;
