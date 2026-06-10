// hooks/useAuth.ts
"use client";
import { useState, useEffect, useCallback } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";

export type AuthUser = {
  uid:            string;
  name:           string;
  email:          string;
  avatar:         string;
  level:          number;
  xp:             number;
  streak:         number;
  healthScore:    number;
  goalBudget:     number;
  emergencyLimit: number;
  rank:           string;
  telegramChatId?: string;
};

const DEFAULT_PROFILE = {
  level:          14,
  xp:             680,
  streak:         7,
  healthScore:    82,
  goalBudget:     175000,
  emergencyLimit: 225000,
  rank:           "Gold III",
  telegramChatId: "",
};

export function useAuth() {
  const [user,    setUser]    = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const ref  = doc(db, "users", firebaseUser.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          // Auto-upgrade rank based on level for existing users
          const lvl  = data.level || 1;
          const rank = lvl >= 20 ? "Diamond I" : lvl >= 15 ? "Platinum I"
                     : lvl >= 13 ? "Gold III"  : lvl >= 11 ? "Gold II"
                     : lvl >= 9  ? "Gold I"    : lvl >= 7  ? "Silver II"
                     : lvl >= 5  ? "Silver I"  : lvl >= 3  ? "Bronze II" : "Bronze I";
          // Update rank in Firestore if it changed
          if (data.rank !== rank) {
            await updateDoc(ref, { rank });
          }
          setUser({ uid: firebaseUser.uid, ...data, rank } as AuthUser);
        } else {
          // Create profile for new users (Google login)
          const initials = (firebaseUser.displayName || "U")
            .split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
          const profile = {
            name:   firebaseUser.displayName || "New Saver",
            email:  firebaseUser.email!,
            avatar: initials,
            ...DEFAULT_PROFILE,
          };
          await setDoc(ref, { ...profile, createdAt: serverTimestamp() });
          setUser({ uid: firebaseUser.uid, ...profile });
        }
      } catch (e) {
        console.error("useAuth error:", e);
        // Still set a basic user so app doesn't stay blank
        setUser({
          uid:    firebaseUser.uid,
          name:   firebaseUser.displayName || "User",
          email:  firebaseUser.email!,
          avatar: "U",
          ...DEFAULT_PROFILE,
        });
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e: any) {
      const msg = e.code === "auth/invalid-credential"
        ? "Wrong email or password"
        : e.code === "auth/user-not-found"
        ? "No account with this email"
        : e.code === "auth/too-many-requests"
        ? "Too many attempts — try again later"
        : e.message;
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    setError(null);
    try {
      const cred     = await createUserWithEmailAndPassword(auth, email, password);
      const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
      const profile  = {
        name,
        email,
        avatar: initials,
        ...DEFAULT_PROFILE,
      };
      await setDoc(doc(db, "users", cred.user.uid), {
        ...profile,
        createdAt: serverTimestamp(),
      });
      setUser({ uid: cred.user.uid, ...profile });
    } catch (e: any) {
      const msg = e.code === "auth/email-already-in-use"
        ? "An account with this email already exists"
        : e.message;
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e: any) {
      const msg = e.code === "auth/popup-closed-by-user"
        ? "Google sign-in was cancelled"
        : e.message;
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Logout error:", e);
    }
  }, []);

  const sendVerificationCode = useCallback(async (email: string, name: string) => {
    setError(null);
    const res  = await fetch("/api/send-verification", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email, name }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to send code");
    return true;
  }, []);

  const verifyCode = useCallback(async (
    email: string,
    code:  string,
    name:  string,
    sendWelcome: boolean
  ) => {
    setError(null);
    const res  = await fetch("/api/verify-code", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email, code, name, sendWelcome }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Invalid code");
    return true;
  }, []);

  const updateUserProfile = useCallback(async (updates: Partial<AuthUser>) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "users", user.uid), updates);
      setUser((prev) => prev ? { ...prev, ...updates } : prev);
    } catch (e) {
      console.error("updateUserProfile error:", e);
    }
  }, [user]);

  return {
    user,
    loading,
    error,
    clearError: () => setError(null),
    login,
    register,
    loginWithGoogle,
    logout,
    sendVerificationCode,
    verifyCode,
    updateUserProfile,
  };
}
