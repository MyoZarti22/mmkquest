// hooks/useAuth.ts
"use client";
import { useState, useEffect, useCallback } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";

export type AuthUser = {
  uid: string;
  name: string;
  email: string;
  avatar: string;
  level: number;
  xp: number;
  streak: number;
  healthScore: number;
  goalBudget: number;
  emergencyLimit: number;
  rank: string;
  emailVerified: boolean;
  notificationPrefs: {
    budgetEmail: boolean;
    transactionEmail: boolean;
    xpEmail: boolean;
    streakEmail: boolean;
  };
};

export function useAuth() {
  const [user, setUser]       = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  // Listen to Firebase auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await fetchUserProfile(firebaseUser);
        setUser(profile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Fetch user profile from Firestore
  const fetchUserProfile = async (firebaseUser: User): Promise<AuthUser> => {
    const ref  = doc(db, "users", firebaseUser.uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return { uid: firebaseUser.uid, ...snap.data() } as AuthUser;
    }
    // New user — create default profile
    const initials = (firebaseUser.displayName || "U")
      .split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
    const profile: Omit<AuthUser, "uid"> = {
      name:            firebaseUser.displayName || "New Saver",
      email:           firebaseUser.email!,
      avatar:          initials,
      level:           1,
      xp:              0,
      streak:          0,
      healthScore:     50,
      goalBudget:      175000,
      emergencyLimit:  225000,
      rank:            "Bronze I",
      emailVerified:   firebaseUser.emailVerified,
      notificationPrefs: {
        budgetEmail:      true,
        transactionEmail: true,
        xpEmail:          true,
        streakEmail:      false,
      },
    };
    await setDoc(ref, { ...profile, createdAt: serverTimestamp() });
    return { uid: firebaseUser.uid, ...profile };
  };

  // ── STEP 1: Send verification code ───────────────────────────────────────
  const sendVerificationCode = useCallback(async (email: string, name: string) => {
    setError(null);
    const res = await fetch("/api/send-verification", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email, name }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to send code");
    return true;
  }, []);

  // ── STEP 2: Verify the code ───────────────────────────────────────────────
  const verifyCode = useCallback(async (
    email: string, code: string, name: string, isNewUser: boolean
  ) => {
    setError(null);
    const res = await fetch("/api/verify-code", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email, code, name, isNewUser }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Verification failed");
    return true;
  }, []);

  // ── REGISTER ─────────────────────────────────────────────────────────────
  const register = useCallback(async (email: string, password: string, name: string) => {
    setError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      const profile = await fetchUserProfile(cred.user);
      setUser(profile);
      return profile;
    } catch (e: any) {
      const msg = e.code === "auth/email-already-in-use"
        ? "This email is already registered. Please sign in."
        : e.code === "auth/weak-password"
          ? "Password must be at least 6 characters."
          : "Registration failed. Please try again.";
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  // ── LOGIN ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const cred    = await signInWithEmailAndPassword(auth, email, password);
      const profile = await fetchUserProfile(cred.user);
      setUser(profile);
      return profile;
    } catch (e: any) {
      const msg = e.code === "auth/invalid-credential"
        ? "Incorrect email or password."
        : e.code === "auth/user-not-found"
          ? "No account found with this email."
          : "Login failed. Please try again.";
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  // ── GOOGLE LOGIN ─────────────────────────────────────────────────────────
  const loginWithGoogle = useCallback(async () => {
    setError(null);
    try {
      const result  = await signInWithPopup(auth, googleProvider);
      const profile = await fetchUserProfile(result.user);
      setUser(profile);
      return profile;
    } catch (e: any) {
      const msg = "Google sign-in failed. Please try again.";
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  // ── LOGOUT ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await signOut(auth);
    setUser(null);
  }, []);

  // ── UPDATE PROFILE ────────────────────────────────────────────────────────
  const updateUserProfile = useCallback(async (updates: Partial<AuthUser>) => {
    if (!user) return;
    const ref = doc(db, "users", user.uid);
    await setDoc(ref, updates, { merge: true });
    setUser((prev) => prev ? { ...prev, ...updates } : null);
  }, [user]);

  return {
    user, loading, error,
    sendVerificationCode,
    verifyCode,
    register,
    login,
    loginWithGoogle,
    logout,
    updateUserProfile,
    clearError: () => setError(null),
  };
}
