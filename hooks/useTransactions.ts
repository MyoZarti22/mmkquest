// hooks/useTransactions.ts
"use client";
import { useState, useEffect, useCallback } from "react";
import {
  collection, addDoc, query,
  where, onSnapshot, serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { AuthUser } from "./useAuth";

export type Transaction = {
  id:        string;
  userId:    string;
  name:      string;
  amount:    number;
  type:      "expense" | "income";
  category:  string;
  wallet:    string;
  timestamp: string;
};

export const WALLETS = [
  { id: "kbzpay",  name: "KBZ Pay",  short: "KBZ",  balance: 180000, color: "#22c55e", status: "connected" },
  { id: "wavepay", name: "WavePay",  short: "Wave", balance: 82500,  color: "#3b82f6", status: "connected" },
  { id: "cbpay",   name: "CB Pay",   short: "CB",   balance: 25000,  color: "#a855f7", status: "connected" },
  { id: "uabpay",  name: "UAB Pay",  short: "UAB",  balance: 15000,  color: "#f59e0b", status: "connected" },
  { id: "ayapay",  name: "AYA Pay",  short: "AYA",  balance: 10000,  color: "#ef4444", status: "connected" },
  { id: "cash",    name: "Cash",     short: "Cash", balance: 0,      color: "#8888a0", status: "manual"    },
];

export const CAT_ICONS: Record<string, string> = {
  food: "food", gaming: "gaming", transport: "bus",
  shopping: "shop", bills: "bill", income: "trending", other: "coin",
};

export const CAT_COLORS: Record<string, string> = {
  food: "#f59e0b", gaming: "#a855f7", transport: "#3b82f6",
  shopping: "#ef4444", bills: "#06b6d4", income: "#22c55e", other: "#8888a0",
};

export function useTransactions(user: AuthUser | null) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading,      setLoading]      = useState(false);

  useEffect(() => {
    if (!user?.uid) {
      setTransactions([]);
      return;
    }

    setLoading(true);

    const q = query(
      collection(db, "transactions"),
      where("userId", "==", user.uid)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const txs = snap.docs
          .map((d) => ({ id: d.id, ...d.data() } as Transaction))
          .sort((a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
        setTransactions(txs);
        setLoading(false);
      },
      (err) => {
        console.error("Firestore snapshot error:", err);
        setTransactions([]);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [user?.uid]);

  const addCashTransaction = useCallback(async (
    name: string, amount: number, category: string, wallet: string
  ) => {
    if (!user) throw new Error("Not logged in");
    const tx = {
      userId:    user.uid,
      name,
      amount:    -Math.abs(amount),
      type:      "expense" as const,
      category,
      wallet,
      timestamp: new Date().toISOString(),
    };
    await addDoc(collection(db, "transactions"), {
      ...tx,
      createdAt: serverTimestamp(),
    });

    // Background: send notification email
    const newSpent = transactions
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + Math.abs(t.amount), 0) + amount;

    const pct = (newSpent / (user.goalBudget || 175000)) * 100;
    if (pct >= 80) {
      fetch("/api/notify", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type:   "budget_warning",
          userId: user.uid,
          data: {
            spent:     newSpent,
            goal:      user.goalBudget,
            emergency: user.emergencyLimit,
            message:   `${Math.round(pct)}% of monthly budget used`,
          },
        }),
      }).catch(() => {});
    }

    fetch("/api/notify", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type:   "transaction",
        userId: user.uid,
        data: { txName: name, amount: -Math.abs(amount), wallet, category, message: `Expense: ${name}` },
      }),
    }).catch(() => {});

    return tx;
  }, [user, transactions]);

  // Current month stats
  const now = new Date();
  const currentMonthTx = transactions.filter((t) => {
    const d = new Date(t.timestamp);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const totalSpent  = currentMonthTx.filter((t) => t.type === "expense").reduce((s, t) => s + Math.abs(t.amount), 0);
  const totalIncome = currentMonthTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalBalance = WALLETS.reduce((s, w) => s + w.balance, 0);

  const categoryTotals: Record<string, number> = {};
  currentMonthTx.filter((t) => t.type === "expense").forEach((t) => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Math.abs(t.amount);
  });

  const goal      = user?.goalBudget     || 175000;
  const emergency = user?.emergencyLimit || 225000;
  const zone      = totalSpent <= goal ? "safe" : totalSpent <= emergency ? "warn" : "danger";
  const bonusXP   = zone === "safe" ? Math.floor((goal - totalSpent) / 1000) * 5 : 0;
  const projectedXP = zone === "safe" ? 100 + bonusXP : zone === "warn" ? 40 : 0;
  const budgetPct = Math.min((totalSpent / emergency) * 100, 100);

  return {
    transactions,
    loading,
    addCashTransaction,
    totalSpent,
    totalIncome,
    totalBalance,
    categoryTotals,
    budgetPct,
    zone,
    projectedXP,
  };
}
