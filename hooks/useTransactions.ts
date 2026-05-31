// hooks/useTransactions.ts
"use client";
import { useState, useEffect, useCallback } from "react";
import {
  collection, addDoc, query, where, orderBy,
  onSnapshot, serverTimestamp, getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { AuthUser } from "./useAuth";

export type Transaction = {
  id:        string;
  userId:    string;
  name:      string;
  amount:    number;         // negative = expense, positive = income
  type:      "expense" | "income";
  category:  string;
  wallet:    string;
  source:    "manual" | "sms" | "email_parse";
  timestamp: string;
};

export type WalletBalance = {
  id:      string;
  name:    string;
  short:   string;
  balance: number;
  color:   string;
  status:  "connected" | "manual";
};

// Myanmar wallets — balances tracked manually until API integration
export const WALLETS: WalletBalance[] = [
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

function calcXP(spent: number, goal: number, emergency: number): { xp: number; zone: string } {
  if (spent <= goal) {
    const saved  = goal - spent;
    const bonus  = Math.floor(saved / 1000) * 5;
    return { xp: 100 + bonus, zone: "safe" };
  }
  if (spent <= emergency) return { xp: 40, zone: "warn" };
  return { xp: 0, zone: "danger" };
}

export function useTransactions(user: AuthUser | null) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading,      setLoading]      = useState(true);

  // Real-time listener on Firestore
  useEffect(() => {
    if (!user) { setTransactions([]); setLoading(false); return; }

    const q = query(
      collection(db, "transactions"),
      where("userId",  "==", user.uid),
      orderBy("timestamp", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const txs = snap.docs.map((d) => ({
        id: d.id, ...d.data(),
      })) as Transaction[];
      setTransactions(txs);
      setLoading(false);
    });

    return () => unsub();
  }, [user?.uid]);

  // Add a new CASH transaction (manual entry)
  const addCashTransaction = useCallback(async (
    name: string,
    amount: number,
    category: string,
    wallet: string,
  ) => {
    if (!user) throw new Error("Not logged in");

    const tx = {
      userId:    user.uid,
      name,
      amount:    -Math.abs(amount),       // always negative for expense
      type:      "expense" as const,
      category,
      wallet,
      source:    "manual" as const,
      timestamp: new Date().toISOString(),
    };

    await addDoc(collection(db, "transactions"), {
      ...tx, createdAt: serverTimestamp(),
    });

    // Check if budget warning should fire
    const spent = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0) + Math.abs(amount);

    const pct = (spent / user.goalBudget) * 100;
    if (pct >= 80) {
      // Fire notification API
      await fetch("/api/notify", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type:   "budget_warning",
          userId: user.uid,
          data: {
            spent,
            goal:      user.goalBudget,
            emergency: user.emergencyLimit,
            message:   `${Math.round(pct)}% of monthly budget used`,
          },
        }),
      });
    }

    // Transaction notification
    await fetch("/api/notify", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type:   "transaction",
        userId: user.uid,
        data: {
          txName:   name,
          amount:   -Math.abs(amount),
          wallet,
          category,
          message:  `Expense logged: ${name} — ${amount.toLocaleString()} MMK`,
        },
      }),
    });

    return tx;
  }, [user, transactions]);

  // Computed values
  const currentMonthTx = transactions.filter((t) => {
    const d = new Date(t.timestamp);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const totalSpent  = currentMonthTx
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + Math.abs(t.amount), 0);

  const totalIncome = currentMonthTx
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);

  const totalBalance = WALLETS.reduce((s, w) => s + w.balance, 0);

  const categoryTotals: Record<string, number> = {};
  currentMonthTx
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Math.abs(t.amount);
    });

  const { xp, zone } = calcXP(
    totalSpent,
    user?.goalBudget    || 175000,
    user?.emergencyLimit || 225000
  );

  const budgetPct = Math.min(
    (totalSpent / (user?.emergencyLimit || 225000)) * 100,
    100
  );

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
    projectedXP: xp,
  };
}
