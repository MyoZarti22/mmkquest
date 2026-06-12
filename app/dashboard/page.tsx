// app/dashboard/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useTransactions, CAT_COLORS, CAT_ICONS } from "@/hooks/useTransactions";
import { doc, updateDoc, getDoc, setDoc, collection, getDocs, writeBatch } from "firebase/firestore";
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider, deleteUser } from "firebase/auth";
import { db, auth } from "@/lib/firebase";

// ─── ICON ─────────────────────────────────────────────────────────────────────
function Ic({ n, s = 14, c = "currentColor" }: { n: string; s?: number; c?: string }) {
  const p: Record<string, React.ReactNode> = {
    home:     <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    wallet:   <><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></>,
    target:   <><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>,
    game:     <><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></>,
    user:     <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    analytics:<><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
    plus:     <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    x:        <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    check:    <polyline points="20 6 9 17 4 12"/>,
    star:     <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>,
    zap:      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>,
    dollar:   <><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>,
    trending: <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>,
    bar:      <><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></>,
    shield:   <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>,
    bell:     <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>,
    lock:     <><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>,
    mail:     <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>,
    warn:     <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
    send:     <><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
    trash:    <><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></>,
    logout:   <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
    edit:     <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
    trophy:   <><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></>,
    sun:      <><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></>,
    phone:    <><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></>,
    food:     <path d="M3 11l19-9-9 19-2-8-8-2z"/>,
    gaming:   <><rect x="6" y="11" width="12" height="10" rx="2"/><path d="M6 11V9a6 6 0 0 1 12 0v2"/></>,
    bus:      <><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></>,
    shop:     <><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></>,
    bill:     <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></>,
    coin:     <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>,
    health:   <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
    chevron:  <polyline points="9 18 15 12 9 6"/>,
    link:     <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></>,
    copy:     <><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></>,
    refresh:  <><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></>,
  };
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c}
      strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      {p[n] ?? null}
    </svg>
  );
}

// ─── WALLET DATA (manual balances stored in Firestore) ────────────────────────
const WALLET_LIST = [
  { id: "kbzpay",  name: "KBZ Pay",  short: "KBZ",  color: "#22c55e" },
  { id: "wavepay", name: "WavePay",  short: "Wave", color: "#3b82f6" },
  { id: "cbpay",   name: "CB Pay",   short: "CB",   color: "#a855f7" },
  { id: "uabpay",  name: "UAB Pay",  short: "UAB",  color: "#f59e0b" },
  { id: "ayapay",  name: "AYA Pay",  short: "AYA",  color: "#ef4444" },
  { id: "cash",    name: "Cash",     short: "Cash", color: "#8888a0" },
];

// ─── SHARED UI ────────────────────────────────────────────────────────────────
const CARD: React.CSSProperties = { background: "#161619", border: "1px solid #242428", borderRadius: 10, padding: "13px 15px" };
function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ ...CARD, ...style }}>{children}</div>;
}
function Lbl({ icon, children, style }: { icon?: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color: "#444456", marginBottom: 10, display: "flex", alignItems: "center", gap: 5, ...style }}>
      {icon && <Ic n={icon} s={10} c="#444456" />}{children}
    </div>
  );
}
function Sec({ title, children, danger }: { title: string; children: React.ReactNode; danger?: boolean }) {
  return (
    <div style={{ background: "#161619", border: "1px solid #242428", borderRadius: 10, overflow: "hidden", marginBottom: 12 }}>
      <div style={{ padding: "9px 15px", fontSize: 10, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: danger ? "#ef4444" : "#444456", borderBottom: "1px solid #242428", background: "#111114" }}>{title}</div>
      {children}
    </div>
  );
}
function SRow({ icon, iconColor, iconBg, name, desc, right, onClick }: any) {
  return (
    <div onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 15px", borderBottom: "1px solid #242428", cursor: onClick ? "pointer" : "default" }}>
      {icon && (
        <div style={{ width: 32, height: 32, borderRadius: 8, background: iconBg || "#242428", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Ic n={icon} s={14} c={iconColor || "#8888a0"} />
        </div>
      )}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: "#f0f0f5" }}>{name}</div>
        {desc && <div style={{ fontSize: 10, color: "#444456", marginTop: 1 }}>{desc}</div>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>{right}</div>
    </div>
  );
}
function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <div onClick={onToggle} style={{ width: 38, height: 21, borderRadius: 11, background: on ? "#22c55e" : "#2e2e35", position: "relative", cursor: "pointer", transition: "background .2s", flexShrink: 0 }}>
      <div style={{ position: "absolute", top: 3, left: on ? 20 : 3, width: 15, height: 15, borderRadius: "50%", background: "#f0f0f5", transition: "left .2s" }} />
    </div>
  );
}
function LiveDot() {
  return <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block", marginLeft: 3, animation: "blink 1.2s ease-in-out infinite" }} />;
}
function Spinner() {
  return <span style={{ width: 14, height: 14, border: "2px solid currentColor", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block", animation: "spin 1s linear infinite" }} />;
}

// ─── EDIT WALLET MODAL ────────────────────────────────────────────────────────
function EditWalletModal({ wallet, current, onSave, onClose }: { wallet: typeof WALLET_LIST[0]; current: number; onSave: (v: number) => void; onClose: () => void }) {
  const [val, setVal] = useState(String(current));
  const save = () => { onSave(Number(val) || 0); onClose(); };
  return (
    <div onClick={(e) => e.target === e.currentTarget && onClose()} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.8)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#161619", border: "1px solid #2e2e35", borderRadius: 14, padding: 24, width: 320 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: `${wallet.color}18`, border: `1px solid ${wallet.color}40`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Ic n="wallet" s={16} c={wallet.color} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{wallet.name}</div>
              <div style={{ fontSize: 10, color: "#444456" }}>Update balance manually</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}><Ic n="x" s={16} c="#444456" /></button>
        </div>
        <label style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "#444456", marginBottom: 6, display: "block" }}>Current Balance (MMK)</label>
        <input autoFocus type="number" value={val} onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && save()}
          style={{ width: "100%", background: "#0a0a0c", border: `1px solid ${wallet.color}60`, borderRadius: 8, padding: "11px 14px", fontSize: 18, fontWeight: 700, color: "#f0f0f5", fontFamily: "monospace", outline: "none", boxSizing: "border-box", marginBottom: 16 }} />
        <button onClick={save} style={{ width: "100%", background: "#22c55e", border: "none", borderRadius: 8, padding: 11, fontSize: 13, fontWeight: 700, color: "#000", cursor: "pointer", fontFamily: "inherit" }}>
          Save Balance
        </button>
      </div>
    </div>
  );
}

// ─── ADD SPEND MODAL ──────────────────────────────────────────────────────────
const CATS = [
  { id: "food", icon: "food" }, { id: "gaming", icon: "gaming" },
  { id: "transport", icon: "bus" }, { id: "shopping", icon: "shop" },
  { id: "bills", icon: "bill" }, { id: "other", icon: "coin" },
];

function AddSpendModal({ open, onClose, onAdd, walletBalances }: any) {
  const [amt,    setAmt]    = useState("");
  const [desc,   setDesc]   = useState("");
  const [cat,    setCat]    = useState("food");
  const [wallet, setWallet] = useState("cash");
  const [busy,   setBusy]   = useState(false);
  const [ok,     setOk]     = useState(false);
  const [errs,   setErrs]   = useState<Record<string, boolean>>({});

  const submit = async () => {
    const e: Record<string, boolean> = {};
    if (!amt)  e.amt  = true;
    if (!desc) e.desc = true;
    if (Object.keys(e).length) { setErrs(e); return; }
    setErrs({}); setBusy(true);
    try {
      await onAdd(desc, Number(amt), cat, wallet);
      setOk(true);
      setTimeout(() => { setOk(false); setAmt(""); setDesc(""); setCat("food"); setWallet("cash"); onClose(); }, 1400);
    } catch { setBusy(false); }
  };

  if (!open) return null;
  const inp = (err?: boolean): React.CSSProperties => ({
    width: "100%", background: "#0a0a0c",
    border: `1px solid ${err ? "#ef4444" : "#2e2e35"}`,
    borderRadius: 7, padding: "9px 11px", fontSize: 13, fontWeight: 500,
    color: "#f0f0f5", fontFamily: "inherit", outline: "none", boxSizing: "border-box",
  });

  return (
    <div onClick={(e) => e.target === e.currentTarget && onClose()} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.85)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#161619", border: "1px solid #2e2e35", borderRadius: 14, padding: 24, width: 360, maxWidth: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ fontSize: 15, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}><Ic n="plus" s={15} c="#22c55e" /> Add Expense</div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex" }}><Ic n="x" s={16} c="#444456" /></button>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "#444456", marginBottom: 5, display: "block" }}>Amount (MMK)</label>
          <input style={{ ...inp(errs.amt), fontFamily: "monospace", fontSize: 20, fontWeight: 700 }} type="number" placeholder="0" value={amt}
            onChange={(e) => { setAmt(e.target.value); setErrs((v) => ({ ...v, amt: false })); }} />
          {errs.amt && <div style={{ fontSize: 10, color: "#ef4444", marginTop: 3 }}>Amount required</div>}
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "#444456", marginBottom: 5, display: "block" }}>Description</label>
          <input style={inp(errs.desc)} type="text" placeholder="e.g. Shan noodles, Bus fare" value={desc}
            onChange={(e) => { setDesc(e.target.value); setErrs((v) => ({ ...v, desc: false })); }}
            onKeyDown={(e) => e.key === "Enter" && submit()} />
          {errs.desc && <div style={{ fontSize: 10, color: "#ef4444", marginTop: 3 }}>Description required</div>}
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "#444456", marginBottom: 5, display: "block" }}>Category</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 5 }}>
            {CATS.map((c) => (
              <div key={c.id} onClick={() => setCat(c.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "8px 5px", background: cat === c.id ? "rgba(34,197,94,.1)" : "#111114", border: `1px solid ${cat === c.id ? "rgba(34,197,94,.35)" : "#2e2e35"}`, borderRadius: 7, cursor: "pointer", fontSize: 10, fontWeight: 500, color: cat === c.id ? "#22c55e" : "#8888a0", textTransform: "capitalize" }}>
                <Ic n={c.icon} s={14} c={cat === c.id ? "#22c55e" : "#8888a0"} />{c.id}
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "#444456", marginBottom: 5, display: "block" }}>Wallet / Payment</label>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {WALLET_LIST.map((w) => {
              const bal = walletBalances[w.id] || 0;
              return (
                <div key={w.id} onClick={() => setWallet(w.id)} style={{ padding: "5px 10px", background: wallet === w.id ? "rgba(34,197,94,.1)" : "#111114", border: `1px solid ${wallet === w.id ? "rgba(34,197,94,.35)" : "#2e2e35"}`, borderRadius: 20, fontSize: 10, fontWeight: 600, color: wallet === w.id ? "#22c55e" : "#8888a0", cursor: "pointer", textAlign: "center" }}>
                  <div>{w.short}</div>
                  {bal > 0 && <div style={{ fontSize: 8, opacity: .7, fontFamily: "monospace" }}>{(bal / 1000).toFixed(0)}K</div>}
                </div>
              );
            })}
          </div>
        </div>
        <button onClick={submit} disabled={busy} style={{ width: "100%", background: "#22c55e", border: "none", borderRadius: 8, padding: 11, fontSize: 13, fontWeight: 700, color: "#000", cursor: busy ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, opacity: busy ? .7 : 1 }}>
          {busy ? <Spinner /> : "Log Expense"}
        </button>
        {ok && <div style={{ textAlign: "center", marginTop: 10, fontSize: 12, fontWeight: 600, color: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}><Ic n="check" s={12} c="#22c55e" /> Logged — +15 XP!</div>}
      </div>
    </div>
  );
}

// ─── HOME SCREEN ──────────────────────────────────────────────────────────────
function HomeScreen({ user, txData, walletBalances }: any) {
  const { transactions, totalSpent, totalIncome, categoryTotals, budgetPct, zone, projectedXP } = txData;
  const goal      = user?.goalBudget     || 175000;
  const emergency = user?.emergencyLimit || 225000;
  const zoneColor = zone === "safe" ? "#22c55e" : zone === "warn" ? "#f59e0b" : "#ef4444";
  const totalBal  = Object.values(walletBalances as Record<string, number>).reduce((a: number, b: number) => a + b, 0);
  const maxCat    = Math.max(...Object.values(categoryTotals as Record<string, number>), 1) as number;
  const G: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 11, padding: "16px 20px" };

  return (
    <div>
      <div style={G}>
        <Card>
          <Lbl icon="dollar">Balance</Lbl>
          <div style={{ fontFamily: "monospace", fontSize: 20, fontWeight: 700, color: "#22c55e" }}>{totalBal.toLocaleString()}</div>
          <div style={{ fontSize: 10, color: "#444456", marginTop: 3 }}>MMK across all wallets</div>
        </Card>
        <Card>
          <Lbl icon="trending">Income</Lbl>
          <div style={{ fontFamily: "monospace", fontSize: 20, fontWeight: 700, color: "#3b82f6" }}>{totalIncome.toLocaleString()}</div>
          <div style={{ fontSize: 10, color: "#444456", marginTop: 3 }}>MMK this month</div>
        </Card>
        <Card>
          <Lbl icon="wallet">Spent</Lbl>
          <div style={{ fontFamily: "monospace", fontSize: 20, fontWeight: 700, color: "#f59e0b" }}>{totalSpent.toLocaleString()}</div>
          <div style={{ fontSize: 10, color: "#444456", marginTop: 3 }}>of {goal.toLocaleString()} goal</div>
        </Card>

        {/* Budget Meter */}
        <Card style={{ gridColumn: "1/-1" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <Lbl icon="bar">Budget Meter<LiveDot /></Lbl>
            <span style={{ fontSize: 10, fontFamily: "monospace", color: "#444456" }}>+{projectedXP} XP projected</span>
          </div>
          <div style={{ height: 8, background: "#242428", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${budgetPct}%`, background: zoneColor, borderRadius: 4, transition: "width .5s" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5, fontSize: 9, fontFamily: "monospace" }}>
            <span style={{ color: "#444456" }}>0</span>
            <span style={{ color: "#22c55e" }}>Goal {(goal / 1000).toFixed(0)}K</span>
            <span style={{ color: "#f59e0b" }}>Emergency {(emergency / 1000).toFixed(0)}K</span>
          </div>
          <div style={{ marginTop: 8, fontSize: 11, fontWeight: 600, color: zoneColor }}>
            {zone === "safe" ? "Perfect Save Zone — below goal" : zone === "warn" ? "Safe Zone — above goal, below emergency" : "DANGER — Over Emergency Limit!"}
          </div>
        </Card>

        {/* Categories */}
        <Card style={{ gridColumn: "span 2" }}>
          <Lbl icon="bar">Spending by Category</Lbl>
          {Object.keys(categoryTotals).length === 0 ? (
            <div style={{ fontSize: 11, color: "#444456", textAlign: "center", padding: "16px 0" }}>No expenses yet — tap Add Spend!</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {Object.entries(categoryTotals as Record<string, number>).slice(0, 5).map(([cat, val]) => (
                <div key={cat} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 6, background: `${CAT_COLORS[cat] || "#8888a0"}18`, border: `1px solid ${CAT_COLORS[cat] || "#8888a0"}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Ic n={CAT_ICONS[cat] || "coin"} s={12} c={CAT_COLORS[cat] || "#8888a0"} />
                  </div>
                  <div style={{ fontSize: 11, color: "#8888a0", width: 62, flexShrink: 0, textTransform: "capitalize" }}>{cat}</div>
                  <div style={{ flex: 1, height: 4, background: "#242428", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${((val as number) / maxCat) * 100}%`, background: CAT_COLORS[cat] || "#8888a0", borderRadius: 2 }} />
                  </div>
                  <div style={{ fontSize: 10, fontFamily: "monospace", color: "#444456", width: 36, textAlign: "right" }}>
                    {((val as number) / Math.max(totalSpent, 1) * 100).toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Savings Ring */}
        <Card>
          <Lbl icon="target">Savings</Lbl>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="32" fill="none" stroke="#242428" strokeWidth="7" />
              <circle cx="40" cy="40" r="32" fill="none" stroke="#22c55e" strokeWidth="7" strokeLinecap="round"
                strokeDasharray="201"
                strokeDashoffset={201 - Math.min((totalBal / 1000000) * 201, 201)}
                transform="rotate(-90 40 40)" />
              <text x="40" y="40" textAnchor="middle" dy="5" fontFamily="monospace" fontSize="12" fontWeight="700" fill="#22c55e">
                {totalBal > 0 ? `${Math.round(totalBal / 1000)}K` : "0"}
              </text>
            </svg>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 600, color: "#22c55e" }}>{totalBal.toLocaleString()} MMK</div>
              <div style={{ fontSize: 10, color: "#444456", marginTop: 2 }}>total balance</div>
            </div>
          </div>
        </Card>

        {/* Recent Transactions */}
        <Card style={{ gridColumn: "1/-1" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <Lbl icon="wallet">Recent Transactions<LiveDot /></Lbl>
          </div>
          {transactions.length === 0 ? (
            <div style={{ fontSize: 11, color: "#444456", textAlign: "center", padding: "20px 0" }}>
              No transactions yet. Tap <strong style={{ color: "#22c55e" }}>Add Spend</strong> to get started!
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {transactions.slice(0, 6).map((tx: any) => (
                <div key={tx.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: "#111114", border: "1px solid #242428", borderRadius: 8 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: `${CAT_COLORS[tx.category] || "#8888a0"}18`, border: `1px solid ${CAT_COLORS[tx.category] || "#8888a0"}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Ic n={CAT_ICONS[tx.category] || "coin"} s={13} c={CAT_COLORS[tx.category] || "#8888a0"} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 500 }}>{tx.name}</div>
                    <div style={{ fontSize: 10, color: "#444456", marginTop: 1, textTransform: "capitalize" }}>
                      {tx.category} · {WALLET_LIST.find((w) => w.id === tx.wallet)?.name || tx.wallet}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: tx.type === "income" ? "#22c55e" : "#ef4444", textAlign: "right" }}>
                      {tx.type === "income" ? "+" : ""}{tx.amount.toLocaleString()} MMK
                    </div>
                    <div style={{ fontSize: 9, color: "#444456", fontFamily: "monospace", textAlign: "right", marginTop: 2 }}>
                      {new Date(tx.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// ─── WALLET SCREEN (manual only) ──────────────────────────────────────────────
function WalletScreen({ walletBalances, onUpdateBalance, txData }: any) {
  const [editing, setEditing] = useState<typeof WALLET_LIST[0] | null>(null);
  const totalBal = Object.values(walletBalances as Record<string, number>).reduce((a: number, b: number) => a + b, 0);

  return (
    <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
      <Card>
        <Lbl icon="wallet">My Wallets — Manual Mode</Lbl>
        <div style={{ fontSize: 11, color: "#444456", marginBottom: 12, padding: "8px 10px", background: "#111114", borderRadius: 7, border: "1px solid #242428" }}>
          Tap any wallet to update its balance manually. No auto-sync — you stay in full control.
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {WALLET_LIST.map((w) => {
            const bal = walletBalances[w.id] || 0;
            return (
              <div key={w.id} onClick={() => setEditing(w)}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 14px", background: "#111114", border: `1px solid ${bal > 0 ? `${w.color}30` : "#242428"}`, borderRadius: 9, cursor: "pointer", transition: "border-color .15s" }}>
                <div style={{ width: 36, height: 36, background: `${w.color}18`, border: `1px solid ${w.color}40`, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Ic n="wallet" s={16} c={w.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{w.name}</div>
                  <div style={{ fontSize: 10, color: "#444456", marginTop: 1 }}>Tap to update balance</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 700, color: bal > 0 ? w.color : "#444456" }}>
                    {bal > 0 ? `${bal.toLocaleString()} MMK` : "—"}
                  </div>
                </div>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: bal > 0 ? "#22c55e" : "#2e2e35", flexShrink: 0 }} />
              </div>
            );
          })}
        </div>
      </Card>

      {totalBal > 0 && (
        <Card style={{ background: "rgba(34,197,94,.06)", border: "1px solid rgba(34,197,94,.2)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "#22c55e", marginBottom: 4 }}>Total Balance</div>
              <div style={{ fontFamily: "monospace", fontSize: 26, fontWeight: 700, color: "#22c55e" }}>{totalBal.toLocaleString()} <span style={{ fontSize: 14 }}>MMK</span></div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, color: "#444456" }}>across all wallets</div>
              <div style={{ fontSize: 10, color: "#22c55e", marginTop: 3 }}>Manual mode</div>
            </div>
          </div>
        </Card>
      )}

      {editing && (
        <EditWalletModal
          wallet={editing}
          current={walletBalances[editing.id] || 0}
          onSave={(v) => { onUpdateBalance(editing.id, v); setEditing(null); }}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

// ─── GOALS SCREEN ─────────────────────────────────────────────────────────────
function GoalsScreen({ user, txData, updateUser }: any) {
  const { totalSpent, zone, projectedXP } = txData;
  const [goalAmt,  setGoalAmt]  = useState(user?.goalBudget     || 175000);
  const [emerAmt,  setEmerAmt]  = useState(user?.emergencyLimit || 225000);
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const zoneColor = zone === "safe" ? "#22c55e" : zone === "warn" ? "#f59e0b" : "#ef4444";

  // Update when user data loads
  useEffect(() => {
    if (user?.goalBudget)     setGoalAmt(user.goalBudget);
    if (user?.emergencyLimit) setEmerAmt(user.emergencyLimit);
  }, [user?.goalBudget, user?.emergencyLimit]);

  const saveGoals = async () => {
    setSaving(true);
    await updateUser({ goalBudget: goalAmt, emergencyLimit: emerAmt });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const challenges = [
    { text: "Spend under 5,000 today",   xp: 25, done: totalSpent < 5000 },
    { text: "Log all expenses today",    xp: 15, done: false },
    { text: "Stay below goal this month",xp: 50, done: zone === "safe" },
    { text: "Save 10,000 MMK this week", xp: 30, done: false },
  ];

  return (
    <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
      <Card>
        <Lbl icon="target">Monthly Goal — {new Date().toLocaleString("default", { month: "long", year: "numeric" })}</Lbl>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 14 }}>
          <div style={{ background: "rgba(34,197,94,.06)", border: "1px solid rgba(34,197,94,.2)", borderRadius: 8, padding: 11, textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "#22c55e", fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>Goal</div>
            <div style={{ fontFamily: "monospace", fontSize: 16, fontWeight: 700, color: "#22c55e" }}>{goalAmt.toLocaleString()}</div>
            <div style={{ fontSize: 9, color: "#444456" }}>MMK</div>
          </div>
          <div style={{ background: "rgba(245,158,11,.06)", border: "1px solid rgba(245,158,11,.2)", borderRadius: 8, padding: 11, textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "#f59e0b", fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>Emergency</div>
            <div style={{ fontFamily: "monospace", fontSize: 16, fontWeight: 700, color: "#f59e0b" }}>{emerAmt.toLocaleString()}</div>
            <div style={{ fontSize: 9, color: "#444456" }}>MMK</div>
          </div>
          <div style={{ background: "#111114", border: "1px solid #242428", borderRadius: 8, padding: 11, textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "#444456", fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>Spent</div>
            <div style={{ fontFamily: "monospace", fontSize: 16, fontWeight: 700 }}>{totalSpent.toLocaleString()}</div>
            <div style={{ fontSize: 9, color: "#444456" }}>MMK</div>
          </div>
        </div>
        <div style={{ background: `${zoneColor}10`, border: `1px solid ${zoneColor}35`, borderRadius: 8, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
          <Ic n={zone === "safe" ? "shield" : "warn"} s={18} c={zoneColor} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: zoneColor }}>
              {zone === "safe" ? "Perfect Save" : zone === "warn" ? "Safe Zone" : "Budget Exceeded"}
            </div>
            <div style={{ fontSize: 10, color: "#444456", marginTop: 2 }}>
              {zone === "safe" ? "Below goal — maximum XP at month end" : zone === "warn" ? "Above goal but below emergency limit" : "Over emergency limit — recovery mode active"}
            </div>
          </div>
          <div style={{ fontFamily: "monospace", fontSize: 15, fontWeight: 700, color: zoneColor }}>+{projectedXP} XP</div>
        </div>
      </Card>

      {/* Edit Goals — fully functional */}
      <Card>
        <Lbl icon="edit">Set Your Monthly Goals</Lbl>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
          <div>
            <label style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: "#22c55e", marginBottom: 6, display: "block" }}>Goal Budget (MMK)</label>
            <input type="number" value={goalAmt} onChange={(e) => setGoalAmt(Number(e.target.value))}
              style={{ width: "100%", background: "#0a0a0c", border: "1px solid rgba(34,197,94,.4)", borderRadius: 8, padding: "10px 12px", fontSize: 15, fontWeight: 700, color: "#22c55e", fontFamily: "monospace", outline: "none", boxSizing: "border-box" }} />
            <div style={{ fontSize: 10, color: "#444456", marginTop: 4 }}>Ideal monthly spending</div>
          </div>
          <div>
            <label style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: "#f59e0b", marginBottom: 6, display: "block" }}>Emergency Limit (MMK)</label>
            <input type="number" value={emerAmt} onChange={(e) => setEmerAmt(Number(e.target.value))}
              style={{ width: "100%", background: "#0a0a0c", border: "1px solid rgba(245,158,11,.4)", borderRadius: 8, padding: "10px 12px", fontSize: 15, fontWeight: 700, color: "#f59e0b", fontFamily: "monospace", outline: "none", boxSizing: "border-box" }} />
            <div style={{ fontSize: 10, color: "#444456", marginTop: 4 }}>Max allowed to spend</div>
          </div>
        </div>
        <button onClick={saveGoals} disabled={saving}
          style={{ width: "100%", background: saved ? "rgba(34,197,94,.1)" : "#22c55e", border: saved ? "1px solid rgba(34,197,94,.4)" : "none", borderRadius: 9, padding: "12px", fontSize: 13, fontWeight: 700, color: saved ? "#22c55e" : "#000", cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all .2s" }}>
          {saving ? <><Spinner /> Saving…</> : saved ? <><Ic n="check" s={14} c="#22c55e" /> Goals Saved!</> : "Save Goals"}
        </button>
      </Card>

      {/* XP Table */}
      <Card>
        <Lbl icon="star">XP Reward System</Lbl>
        {[
          { label: "Perfect Save — Below goal",         xp: "+100 XP", color: "#22c55e", sub: "Full XP + rare badge + bonus per 1K saved" },
          { label: "Safe Zone — Below emergency limit", xp: "+40 XP",  color: "#f59e0b", sub: "Streak continues, reduced reward" },
          { label: "Budget Fail — Over emergency",      xp: "0 XP",    color: "#ef4444", sub: "Streak broken, XP penalty applied" },
          { label: "Bonus — per 1,000 MMK below goal",  xp: "+5 XP",   color: "#a855f7", sub: "Stacks on top of base reward" },
        ].map((r, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: i < 3 ? "1px solid #242428" : "none" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 500 }}>{r.label}</div>
              <div style={{ fontSize: 10, color: "#444456", marginTop: 1 }}>{r.sub}</div>
            </div>
            <div style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: r.color, marginLeft: 12, flexShrink: 0 }}>{r.xp}</div>
          </div>
        ))}
      </Card>

      {/* Challenges */}
      <Card>
        <Lbl icon="check">Active Challenges</Lbl>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {challenges.map((ch, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 11px", background: ch.done ? "rgba(34,197,94,.05)" : "#111114", border: `1px solid ${ch.done ? "rgba(34,197,94,.2)" : "#242428"}`, borderRadius: 8 }}>
              <div style={{ width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${ch.done ? "#22c55e" : "#2e2e35"}`, background: ch.done ? "rgba(34,197,94,.2)" : "none", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {ch.done && <Ic n="check" s={9} c="#22c55e" />}
              </div>
              <span style={{ flex: 1, fontSize: 12, fontWeight: 500, color: ch.done ? "#22c55e" : "#8888a0", textDecoration: ch.done ? "none" : "none" }}>{ch.text}</span>
              <span style={{ fontSize: 10, fontFamily: "monospace", fontWeight: 700, color: ch.done ? "#22c55e" : "#f59e0b" }}>{ch.done ? "✓ Done" : `+${ch.xp} XP`}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── GAME SCREEN ──────────────────────────────────────────────────────────────
function GameScreen({ user }: any) {
  const lvl    = user?.level  || 1;
  const xp     = user?.xp     || 0;
  const streak = user?.streak || 0;
  const rank   = user?.rank   || "Bronze I";

  const RANKS = [
    { name: "Bronze I",   minLvl: 1  }, { name: "Bronze II",  minLvl: 3  },
    { name: "Silver I",   minLvl: 5  }, { name: "Silver II",  minLvl: 7  },
    { name: "Gold I",     minLvl: 9  }, { name: "Gold II",    minLvl: 11 },
    { name: "Gold III",   minLvl: 13 }, { name: "Platinum I", minLvl: 15 },
    { name: "Diamond I",  minLvl: 20 },
  ];
  const currentRankIdx = RANKS.findIndex((r) => r.name === rank) ?? 6;
  const xpForNext = lvl * 100;
  const xpPct     = Math.min((xp % 100), 100);

  const achievements = [
    { name: "7-Day Streak",  icon: "zap",    unlocked: streak >= 7,   isNew: streak === 7  },
    { name: "First 100K",    icon: "dollar", unlocked: xp >= 100,     isNew: false },
    { name: "Safe Zone",     icon: "shield", unlocked: true,          isNew: false },
    { name: "Speed Saver",   icon: "star",   unlocked: lvl >= 5,      isNew: false },
    { name: "30-Day Legend", icon: "lock",   unlocked: streak >= 30,  isNew: false },
    { name: "Boss Slayer",   icon: "lock",   unlocked: false,         isNew: false },
  ];

  return (
    <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Player Card */}
      <Card style={{ background: "linear-gradient(135deg, #161619 0%, #1c1a24 100%)", border: "1px solid rgba(168,85,247,.3)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 11, color: "#a855f7", fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 4 }}>Saver Rank</div>
            <div style={{ fontFamily: "monospace", fontSize: 22, fontWeight: 700, color: "#f0f0f5" }}>{rank}</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { val: String(lvl),    lbl: "Level",  color: "#f0f0f5" },
              { val: String(xp),     lbl: "XP",     color: "#f59e0b" },
              { val: String(streak), lbl: "Streak", color: "#a855f7" },
            ].map((s) => (
              <div key={s.lbl} style={{ background: "rgba(0,0,0,.3)", borderRadius: 8, padding: "8px 12px", textAlign: "center", minWidth: 56 }}>
                <div style={{ fontFamily: "monospace", fontSize: 16, fontWeight: 700, color: s.color }}>{s.val}</div>
                <div style={{ fontSize: 9, color: "#444456", letterSpacing: ".08em", textTransform: "uppercase", marginTop: 2 }}>{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 5 }}>
          <span style={{ fontWeight: 600 }}>Level {lvl} Progress</span>
          <span style={{ fontFamily: "monospace", color: "#444456" }}>{xp % 100} / 100 XP</span>
        </div>
        <div style={{ height: 7, background: "#242428", borderRadius: 4, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${xpPct}%`, background: "linear-gradient(90deg, #a855f7, #3b82f6)", borderRadius: 4, transition: "width .5s" }} />
        </div>
        <div style={{ fontSize: 10, color: "#444456", marginTop: 4 }}>{100 - (xp % 100)} XP to Level {lvl + 1}</div>
      </Card>

      {/* Boss Battle */}
      <Card style={{ background: "rgba(239,68,68,.04)", border: "1px solid rgba(239,68,68,.2)" }}>
        <Lbl icon="game">Active Boss Battle</Lbl>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#ef4444", marginBottom: 6 }}>Food Monster Lv.5</div>
            <div style={{ fontSize: 10, color: "#444456", marginBottom: 8 }}>HP: 65% remaining</div>
            <div style={{ height: 9, background: "rgba(239,68,68,.15)", borderRadius: 5, overflow: "hidden", marginBottom: 8 }}>
              <div style={{ height: "100%", width: "65%", background: "linear-gradient(90deg, #b91c1c, #ef4444)", borderRadius: 5 }} />
            </div>
            <div style={{ fontSize: 11, color: "#8888a0" }}>Reduce food spending by 15,000 MMK to defeat</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ textAlign: "center", padding: "8px 14px", background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.25)", borderRadius: 8 }}>
              <div style={{ fontFamily: "monospace", fontSize: 15, fontWeight: 700, color: "#ef4444" }}>-15K</div>
              <div style={{ fontSize: 9, color: "#444456" }}>MMK needed</div>
            </div>
            <div style={{ textAlign: "center", padding: "8px 14px", background: "rgba(245,158,11,.1)", border: "1px solid rgba(245,158,11,.25)", borderRadius: 8 }}>
              <div style={{ fontFamily: "monospace", fontSize: 15, fontWeight: 700, color: "#f59e0b" }}>+150</div>
              <div style={{ fontSize: 9, color: "#444456" }}>XP reward</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Rank Ladder */}
      <Card>
        <Lbl icon="trophy">Rank Ladder</Lbl>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {RANKS.map((r, i) => {
            const isCurrent = r.name === rank;
            const isPassed  = i < currentRankIdx;
            return (
              <div key={r.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 11px", background: isCurrent ? "rgba(168,85,247,.08)" : "transparent", border: `1px solid ${isCurrent ? "rgba(168,85,247,.3)" : "transparent"}`, borderRadius: 8 }}>
                <div style={{ fontFamily: "monospace", fontSize: 10, color: "#444456", width: 20 }}>{i + 1}</div>
                <div style={{ flex: 1, fontSize: 12, fontWeight: isCurrent ? 700 : 400, color: isCurrent ? "#a855f7" : isPassed ? "#22c55e" : "#444456" }}>{r.name}</div>
                <div style={{ fontSize: 9, color: "#444456" }}>Lv {r.minLvl}+</div>
                {isPassed  && <Ic n="check" s={11} c="#22c55e" />}
                {isCurrent && <span style={{ fontSize: 9, fontWeight: 700, color: "#a855f7", background: "rgba(168,85,247,.15)", padding: "2px 8px", borderRadius: 10 }}>YOU</span>}
                {!isCurrent && !isPassed && <Ic n="lock" s={11} c="#2e2e35" />}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Achievements */}
      <Card>
        <Lbl icon="trophy">Achievements</Lbl>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          {achievements.map((a) => (
            <div key={a.name} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 11px", borderRadius: 20, border: `1px solid ${a.isNew ? "rgba(34,197,94,.4)" : a.unlocked ? "rgba(245,158,11,.3)" : "#242428"}`, background: a.isNew ? "rgba(34,197,94,.1)" : a.unlocked ? "rgba(245,158,11,.08)" : "transparent", fontSize: 10, fontWeight: 600, color: a.isNew ? "#22c55e" : a.unlocked ? "#f59e0b" : "#444456" }}>
              <Ic n={a.unlocked ? a.icon : "lock"} s={9} c={a.isNew ? "#22c55e" : a.unlocked ? "#f59e0b" : "#444456"} />
              {a.name}
              {a.isNew && <span style={{ fontSize: 8, background: "#22c55e", color: "#000", padding: "1px 5px", borderRadius: 10, fontWeight: 700 }}>NEW</span>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── ANALYTICS SCREEN ─────────────────────────────────────────────────────────
function AnalyticsScreen({ txData }: any) {
  const { transactions } = txData;
  const [view, setView] = useState<"monthly" | "yearly">("monthly");

  const grouped: Record<string, { income: number; expense: number }> = {};
  transactions.forEach((tx: any) => {
    const d   = new Date(tx.timestamp);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!grouped[key]) grouped[key] = { income: 0, expense: 0 };
    if (tx.type === "income")  grouped[key].income  += tx.amount;
    if (tx.type === "expense") grouped[key].expense += Math.abs(tx.amount);
  });

  const yearly: Record<string, { income: number; expense: number }> = {};
  transactions.forEach((tx: any) => {
    const y = String(new Date(tx.timestamp).getFullYear());
    if (!yearly[y]) yearly[y] = { income: 0, expense: 0 };
    if (tx.type === "income")  yearly[y].income  += tx.amount;
    if (tx.type === "expense") yearly[y].expense += Math.abs(tx.amount);
  });

  const monthData = Object.entries(grouped).sort().slice(-6);
  const yearData  = Object.entries(yearly).sort();
  const data      = view === "monthly" ? monthData : yearData;
  const maxVal    = Math.max(...data.map(([, v]) => Math.max(v.income, v.expense)), 1);
  const months    = Object.entries(grouped).sort();
  const lastMonth = months[months.length - 1];
  const prevMonth = months[months.length - 2];
  const expDiff   = lastMonth && prevMonth ? lastMonth[1].expense - prevMonth[1].expense : 0;
  const incDiff   = lastMonth && prevMonth ? lastMonth[1].income  - prevMonth[1].income  : 0;

  const fmtKey = (k: string) => {
    if (view === "yearly") return k;
    const [y, m] = k.split("-");
    return new Date(Number(y), Number(m) - 1).toLocaleString("default", { month: "short", year: "2-digit" });
  };

  return (
    <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", gap: 6 }}>
        {(["monthly", "yearly"] as const).map((v) => (
          <button key={v} onClick={() => setView(v)} style={{ padding: "7px 18px", borderRadius: 20, border: `1px solid ${view === v ? "rgba(34,197,94,.35)" : "#2e2e35"}`, background: view === v ? "rgba(34,197,94,.1)" : "#111114", fontSize: 11, fontWeight: 600, color: view === v ? "#22c55e" : "#8888a0", cursor: "pointer", fontFamily: "inherit", textTransform: "capitalize" }}>
            {v}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Card>
          <Lbl icon="trending">Spending Change</Lbl>
          <div style={{ fontFamily: "monospace", fontSize: 20, fontWeight: 700, color: expDiff > 0 ? "#ef4444" : "#22c55e" }}>
            {expDiff >= 0 ? "+" : ""}{expDiff.toLocaleString()}
          </div>
          <div style={{ fontSize: 10, color: "#444456", marginTop: 3 }}>MMK vs last month</div>
          <div style={{ fontSize: 10, fontWeight: 600, marginTop: 4, color: expDiff > 0 ? "#ef4444" : "#22c55e" }}>
            {expDiff > 0 ? "Spent more" : expDiff < 0 ? "Spent less ↓" : "Same as last month"}
          </div>
        </Card>
        <Card>
          <Lbl icon="dollar">Income Change</Lbl>
          <div style={{ fontFamily: "monospace", fontSize: 20, fontWeight: 700, color: incDiff >= 0 ? "#22c55e" : "#ef4444" }}>
            {incDiff >= 0 ? "+" : ""}{incDiff.toLocaleString()}
          </div>
          <div style={{ fontSize: 10, color: "#444456", marginTop: 3 }}>MMK vs last month</div>
          <div style={{ fontSize: 10, fontWeight: 600, marginTop: 4, color: incDiff >= 0 ? "#22c55e" : "#ef4444" }}>
            {incDiff > 0 ? "Earned more ↑" : incDiff < 0 ? "Earned less" : "Same as last month"}
          </div>
        </Card>
      </div>

      <Card>
        <Lbl icon="analytics">{view === "monthly" ? "Last 6 Months" : "Yearly Overview"}</Lbl>
        {data.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px 0", fontSize: 11, color: "#444456" }}>Add transactions to see analytics</div>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 110, marginTop: 10 }}>
              {data.map(([key, val]) => (
                <div key={key} style={{ flex: 1, display: "flex", gap: 2, alignItems: "flex-end", height: "100%" }}>
                  <div style={{ flex: 1, background: "#22c55e", borderRadius: "2px 2px 0 0", height: `${(val.income / maxVal) * 95}%`, minHeight: 3, opacity: .8 }} />
                  <div style={{ flex: 1, background: "#ef4444", borderRadius: "2px 2px 0 0", height: `${(val.expense / maxVal) * 95}%`, minHeight: 3, opacity: .8 }} />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
              {data.map(([key]) => (
                <div key={key} style={{ flex: 1, textAlign: "center", fontSize: 9, color: "#444456", fontFamily: "monospace" }}>{fmtKey(key)}</div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 10, justifyContent: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#8888a0" }}><div style={{ width: 10, height: 10, background: "#22c55e", borderRadius: 2 }} /> Income</div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#8888a0" }}><div style={{ width: 10, height: 10, background: "#ef4444", borderRadius: 2 }} /> Expense</div>
            </div>
          </>
        )}
      </Card>

      <Card>
        <Lbl icon="calendar">Month-by-Month History</Lbl>
        {months.length === 0 ? (
          <div style={{ textAlign: "center", padding: "12px 0", fontSize: 11, color: "#444456" }}>No data yet</div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, padding: "6px 0 10px", borderBottom: "1px solid #242428", fontSize: 9, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: "#444456" }}>
              <span>Month</span><span style={{ textAlign: "right" }}>Income</span><span style={{ textAlign: "right" }}>Expense</span><span style={{ textAlign: "right" }}>Net</span>
            </div>
            {[...months].reverse().map(([key, val]) => {
              const net = val.income - val.expense;
              const [y, m] = key.split("-");
              const label = new Date(Number(y), Number(m) - 1).toLocaleString("default", { month: "short", year: "numeric" });
              return (
                <div key={key} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, padding: "9px 0", borderBottom: "1px solid #242428", alignItems: "center" }}>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>{label}</div>
                  <div style={{ textAlign: "right", fontFamily: "monospace", fontSize: 11, fontWeight: 600, color: "#22c55e" }}>{val.income.toLocaleString()}</div>
                  <div style={{ textAlign: "right", fontFamily: "monospace", fontSize: 11, fontWeight: 600, color: "#ef4444" }}>{val.expense.toLocaleString()}</div>
                  <div style={{ textAlign: "right", fontFamily: "monospace", fontSize: 11, fontWeight: 700, color: net >= 0 ? "#22c55e" : "#ef4444" }}>
                    {net >= 0 ? "+" : ""}{net.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </Card>
    </div>
  );
}

// ─── PROFILE SCREEN ───────────────────────────────────────────────────────────
function ProfileScreen({ user, onLogout, updateUser, txData }: any) {
  const [ptab,       setPtab]      = useState("overview");

  // ── Overview state ───────────────────────────────────────────────────────────
  const [editName,   setEditName]  = useState(false);
  const [nameVal,    setNameVal]   = useState(user?.name || "");
  const [nameSaving, setNameSave]  = useState(false);
  const [nameSaved,  setNameSaved] = useState(false);

  // ── Notifications state ──────────────────────────────────────────────────────
  const [notifs, setNotifs] = useState({
    budget: user?.notifs?.budget ?? true,
    xp:     user?.notifs?.xp    ?? true,
    streak: user?.notifs?.streak ?? false,
    transactions: user?.notifs?.transactions ?? true,
    email:  user?.notifs?.email  ?? true,
  });
  const [notifSaved, setNotifSaved] = useState(false);
  const saveNotifs = async (next: typeof notifs) => {
    setNotifs(next);
    await updateUser({ notifs: next });
    setNotifSaved(true);
    setTimeout(() => setNotifSaved(false), 2000);
  };

  // ── Telegram state ───────────────────────────────────────────────────────────
  const [tgChatId,  setTgId]    = useState(user?.telegramChatId || "");
  const [tgSaving,  setTgSave]  = useState(false);
  const [tgSaved,   setTgSaved] = useState(false);
  const [copied,    setCopied]  = useState(false);

  // ── Settings / goals state ───────────────────────────────────────────────────
  const [editGoal,   setEditGoal]   = useState(false);
  const [editEmer,   setEditEmer]   = useState(false);
  const [goalVal,    setGoalVal]    = useState(String(user?.goalBudget || 175000));
  const [emerVal,    setEmerVal]    = useState(String(user?.emergencyLimit || 225000));
  const [goalSaving, setGoalSaving] = useState(false);
  const [goalSaved,  setGoalSaved]  = useState(false);

  // ── Security state ───────────────────────────────────────────────────────────
  const [showChangePw,   setShowChangePw]  = useState(false);
  const [currentPw,      setCurrentPw]     = useState("");
  const [newPw,          setNewPw]         = useState("");
  const [confirmPw,      setConfirmPw]     = useState("");
  const [pwSaving,       setPwSaving]      = useState(false);
  const [pwMsg,          setPwMsg]         = useState({ text: "", ok: false });
  const [twoFA,          setTwoFA]         = useState(false);
  const [showDeleteConf, setShowDeleteConf]= useState(false);
  const [deleteConfText, setDeleteConfText]= useState("");
  const [deletePw,       setDeletePw]      = useState("");
  const [deleting,       setDeleting]      = useState(false);
  const [showResetConf,  setShowResetConf] = useState(false);
  const [resetting,      setResetting]     = useState(false);

  const PTABS = ["overview", "notifications", "telegram", "settings", "security"];

  // ── Save display name ────────────────────────────────────────────────────────
  const saveName = async () => {
    if (!nameVal.trim()) return;
    setNameSave(true);
    await updateUser({ name: nameVal.trim() });
    setNameSave(false); setEditName(false); setNameSaved(true);
    setTimeout(() => setNameSaved(false), 2000);
  };

  // ── Telegram ─────────────────────────────────────────────────────────────────
  const copyBotLink = () => {
    navigator.clipboard.writeText("https://t.me/MMKQuestBot");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const saveTelegramId = async () => {
    if (!tgChatId.trim()) return;
    setTgSave(true);
    await updateUser({ telegramChatId: tgChatId.trim() });
    try {
      await fetch("/api/telegram", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId: tgChatId.trim(), type: "test", data: {} }),
      });
    } catch {}
    setTgSave(false); setTgSaved(true);
    setTimeout(() => setTgSaved(false), 3000);
  };

  // ── Goals ────────────────────────────────────────────────────────────────────
  const saveGoalBudget = async () => {
    setGoalSaving(true);
    await updateUser({ goalBudget: Number(goalVal) });
    setGoalSaving(false); setEditGoal(false); setGoalSaved(true);
    setTimeout(() => setGoalSaved(false), 2000);
  };
  const saveEmerLimit = async () => {
    setGoalSaving(true);
    await updateUser({ emergencyLimit: Number(emerVal) });
    setGoalSaving(false); setEditEmer(false); setGoalSaved(true);
    setTimeout(() => setGoalSaved(false), 2000);
  };

  // ── Export CSV ───────────────────────────────────────────────────────────────
  const exportCSV = () => {
    const txs = txData?.transactions || [];
    if (txs.length === 0) { alert("No transactions to export yet."); return; }
    const rows = [
      ["Date", "Name", "Category", "Wallet", "Type", "Amount (MMK)"],
      ...txs.map((t: any) => [
        new Date(t.timestamp).toLocaleDateString(),
        t.name, t.category, t.wallet, t.type, t.amount,
      ]),
    ];
    const csv  = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `mmkquest-transactions-${new Date().toISOString().slice(0,10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  // ── Change password ──────────────────────────────────────────────────────────
  const changePassword = async () => {
    setPwMsg({ text: "", ok: false });
    if (newPw.length < 6)      { setPwMsg({ text: "New password must be at least 6 characters", ok: false }); return; }
    if (newPw !== confirmPw)   { setPwMsg({ text: "Passwords do not match", ok: false }); return; }
    setPwSaving(true);
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser || !firebaseUser.email) throw new Error("Not logged in");
      const cred = EmailAuthProvider.credential(firebaseUser.email, currentPw);
      await reauthenticateWithCredential(firebaseUser, cred);
      await updatePassword(firebaseUser, newPw);
      setPwMsg({ text: "Password changed successfully!", ok: true });
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      setTimeout(() => setShowChangePw(false), 2000);
    } catch (e: any) {
      const msg = e.code === "auth/wrong-password" ? "Current password is incorrect"
                : e.code === "auth/too-many-requests" ? "Too many attempts, try again later"
                : e.message;
      setPwMsg({ text: msg, ok: false });
    } finally { setPwSaving(false); }
  };

  // ── Reset XP ─────────────────────────────────────────────────────────────────
  const resetXP = async () => {
    setResetting(true);
    await updateUser({ xp: 0, level: 1, streak: 0, rank: "Bronze I", healthScore: 50 });
    setResetting(false); setShowResetConf(false);
    alert("XP and progress reset to zero.");
  };

  // ── Delete account ────────────────────────────────────────────────────────────
  const deleteAccount = async () => {
    if (deleteConfText !== "DELETE") { alert('Type DELETE to confirm'); return; }
    setDeleting(true);
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser || !firebaseUser.email) throw new Error("Not logged in");
      const cred = EmailAuthProvider.credential(firebaseUser.email, deletePw);
      await reauthenticateWithCredential(firebaseUser, cred);
      // Delete all transactions
      const txSnap = await getDocs(collection(db, "transactions"));
      const batch  = writeBatch(db);
      txSnap.docs.forEach((d) => { if (d.data().userId === user.uid) batch.delete(d.ref); });
      batch.delete(doc(db, "users", user.uid));
      await batch.commit();
      await deleteUser(firebaseUser);
      onLogout();
    } catch (e: any) {
      setDeleting(false);
      alert(e.code === "auth/wrong-password" ? "Wrong password" : e.message);
    }
  };

  return (
    <div style={{ padding: "16px 20px" }}>
      {/* Hero */}
      <div style={{ ...CARD, padding: 18, marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <div style={{ width: 62, height: 62, borderRadius: "50%", background: "rgba(34,197,94,.08)", border: "2px solid rgba(34,197,94,.3)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace", fontSize: 22, fontWeight: 700, color: "#22c55e", flexShrink: 0 }}>
            {(user?.name || "U").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{user?.name || "User"}</div>
            <div style={{ fontSize: 11, color: "#a855f7", fontWeight: 600, marginTop: 2, fontFamily: "monospace" }}>{user?.rank || "Bronze I"}</div>
            <div style={{ fontSize: 10, color: "#444456", marginTop: 2 }}>{user?.email}</div>
          </div>
          <button onClick={onLogout} style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "1px solid #2e2e35", borderRadius: 8, padding: "7px 12px", fontSize: 11, fontWeight: 600, color: "#ef4444", cursor: "pointer", fontFamily: "inherit" }}>
            <Ic n="logout" s={11} c="#ef4444" /> Logout
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 14 }}>
          {[
            { val: String(user?.level  || 1),  lbl: "Level",  color: "#f0f0f5" },
            { val: String(user?.streak || 0),  lbl: "Streak", color: "#f59e0b" },
            { val: String(user?.xp     || 0),  lbl: "XP",     color: "#a855f7" },
            { val: user?.rank || "—",          lbl: "Rank",   color: "#22c55e" },
          ].map((s) => (
            <div key={s.lbl} style={{ background: "#111114", border: "1px solid #242428", borderRadius: 8, padding: "9px 10px", textAlign: "center" }}>
              <div style={{ fontFamily: "monospace", fontSize: s.lbl === "Rank" ? 10 : 17, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "#444456", marginTop: 3 }}>{s.lbl}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 5 }}>
          <span style={{ fontWeight: 600 }}>Level {user?.level || 1} Progress</span>
          <span style={{ fontFamily: "monospace", color: "#444456" }}>{(user?.xp || 0) % 100} / 100 XP</span>
        </div>
        <div style={{ height: 6, background: "#242428", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${Math.min((user?.xp || 0) % 100, 100)}%`, background: "#22c55e", borderRadius: 3, transition: "width .5s" }} />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #242428", marginBottom: 14, overflowX: "auto" }}>
        {PTABS.map((t) => (
          <button key={t} onClick={() => setPtab(t)} style={{ padding: "9px 14px", fontSize: 10, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", color: ptab === t ? "#f0f0f5" : "#444456", cursor: "pointer", background: "none", border: "none", borderBottom: `1.5px solid ${ptab === t ? "#22c55e" : "transparent"}`, fontFamily: "inherit", marginBottom: -1, whiteSpace: "nowrap" }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {ptab === "overview" && (
        <Sec title="Account Details">
          {/* Editable name */}
          <div style={{ padding: "12px 15px", borderBottom: "1px solid #242428" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: editName ? 10 : 0 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(59,130,246,.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Ic n="user" s={14} c="#3b82f6" /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{user?.name || "User"}</div>
                <div style={{ fontSize: 10, color: "#444456", marginTop: 1 }}>Display name</div>
              </div>
              {!editName ? (
                <button onClick={() => { setEditName(true); setNameVal(user?.name || ""); }}
                  style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "1px solid #2e2e35", borderRadius: 7, padding: "5px 10px", fontSize: 11, color: "#3b82f6", cursor: "pointer", fontFamily: "inherit" }}>
                  <Ic n="edit" s={11} c="#3b82f6" /> Edit
                </button>
              ) : (
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => setEditName(false)} style={{ background: "none", border: "1px solid #2e2e35", borderRadius: 7, padding: "5px 10px", fontSize: 11, color: "#444456", cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                  <button onClick={saveName} disabled={nameSaving} style={{ background: "#3b82f6", border: "none", borderRadius: 7, padding: "5px 12px", fontSize: 11, fontWeight: 700, color: "#fff", cursor: "pointer", fontFamily: "inherit" }}>{nameSaving ? "Saving…" : "Save"}</button>
                </div>
              )}
            </div>
            {editName && (
              <div style={{ marginLeft: 44 }}>
                <input value={nameVal} onChange={(e) => setNameVal(e.target.value)} autoFocus
                  onKeyDown={(e) => e.key === "Enter" && saveName()}
                  style={{ width: "100%", background: "#0a0a0c", border: "1px solid rgba(59,130,246,.4)", borderRadius: 8, padding: "9px 12px", fontSize: 14, fontWeight: 600, color: "#f0f0f5", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
              </div>
            )}
            {nameSaved && <div style={{ fontSize: 10, color: "#22c55e", marginTop: 4, marginLeft: 44, display: "flex", alignItems: "center", gap: 4 }}><Ic n="check" s={10} c="#22c55e" /> Name updated!</div>}
          </div>
          <SRow icon="mail" iconColor="#a855f7" iconBg="rgba(168,85,247,.1)" name={user?.email || "—"} desc="Email · Verified" right={<span style={{ fontSize: 10, color: "#22c55e", fontWeight: 600 }}>Verified</span>} />
          <SRow icon="dollar" iconColor="#22c55e" iconBg="rgba(34,197,94,.1)" name="Myanmar Kyat (MMK)" desc="Default currency" right={<span style={{ fontSize: 10, color: "#444456" }}>MMK</span>} />
          <SRow icon="calendar" name="Member Since" desc="Account creation date" right={<span style={{ fontSize: 10, fontFamily: "monospace", color: "#444456" }}>{user?.createdAt ? new Date(user.createdAt?.seconds * 1000).toLocaleDateString() : "—"}</span>} />
        </Sec>
      )}

      {/* ── NOTIFICATIONS ── */}
      {ptab === "notifications" && (
        <>
          {notifSaved && <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#22c55e", fontWeight: 600, marginBottom: 10, padding: "8px 12px", background: "rgba(34,197,94,.08)", border: "1px solid rgba(34,197,94,.2)", borderRadius: 8 }}><Ic n="check" s={12} c="#22c55e" /> Notification settings saved!</div>}
          <Sec title="Email Notifications (Gmail)">
            <SRow icon="bell"   iconColor="#22c55e" iconBg="rgba(34,197,94,.1)"  name="Budget Warnings"    desc="Alert at 80% of goal"       right={<Toggle on={notifs.budget}       onToggle={() => saveNotifs({ ...notifs, budget:       !notifs.budget       })} />} />
            <SRow icon="star"   iconColor="#a855f7" iconBg="rgba(168,85,247,.1)" name="XP Rewards"         desc="Notify when XP earned"      right={<Toggle on={notifs.xp}           onToggle={() => saveNotifs({ ...notifs, xp:           !notifs.xp           })} />} />
            <SRow icon="zap"    iconColor="#f59e0b" iconBg="rgba(245,158,11,.1)" name="Streak Reminders"   desc="Daily login reminder"       right={<Toggle on={notifs.streak}       onToggle={() => saveNotifs({ ...notifs, streak:       !notifs.streak       })} />} />
            <SRow icon="wallet"                                                   name="Transaction Alerts" desc="On every expense logged"    right={<Toggle on={notifs.transactions} onToggle={() => saveNotifs({ ...notifs, transactions: !notifs.transactions })} />} />
          </Sec>
          <Sec title="Notification Channels">
            <SRow icon="mail" name="Gmail Alerts" desc={user?.email || "—"} right={<Toggle on={notifs.email} onToggle={() => saveNotifs({ ...notifs, email: !notifs.email })} />} />
            <SRow icon="send" iconColor="#3b82f6" iconBg="rgba(59,130,246,.1)" name="Telegram Bot" desc={user?.telegramChatId ? "Connected ✓" : "Set up in Telegram tab"} right={<><span style={{ fontSize: 10, color: user?.telegramChatId ? "#22c55e" : "#444456" }}>{user?.telegramChatId ? "Connected" : "Not set"}</span><Ic n="chevron" s={12} c="#444456" /></>} onClick={() => setPtab("telegram")} />
          </Sec>
        </>
      )}

      {/* ── TELEGRAM ── */}
      {ptab === "telegram" && (
        <Sec title="Connect Telegram Bot">
          <div style={{ padding: "16px 15px" }}>
            <div style={{ background: "rgba(59,130,246,.06)", border: "1px solid rgba(59,130,246,.2)", borderRadius: 10, padding: "14px 16px", marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#3b82f6", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}><Ic n="send" s={14} c="#3b82f6" /> @MMKQuestBot</div>
              <div style={{ fontSize: 11, color: "#8888a0", lineHeight: 1.7 }}>Get real-time notifications for budget alerts, XP rewards, and transaction alerts directly in Telegram.</div>
            </div>

            <div style={{ fontSize: 11, fontWeight: 700, color: "#f0f0f5", marginBottom: 10 }}>Setup Steps:</div>
            {[
              "Open Telegram and search for @MMKQuestBot",
              "Press START or send /start to the bot",
              "The bot will reply with your Chat ID number",
              "Paste your Chat ID below and click Save",
            ].map((text, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(59,130,246,.15)", border: "1px solid rgba(59,130,246,.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: "monospace", fontSize: 11, fontWeight: 700, color: "#3b82f6" }}>{i + 1}</div>
                <div style={{ fontSize: 12, color: "#8888a0", paddingTop: 3, lineHeight: 1.5 }}>{text}</div>
              </div>
            ))}

            <button onClick={copyBotLink} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, background: "rgba(59,130,246,.1)", border: "1px solid rgba(59,130,246,.3)", borderRadius: 8, padding: "10px", fontSize: 12, fontWeight: 600, color: "#3b82f6", cursor: "pointer", fontFamily: "inherit", marginBottom: 14 }}>
              <Ic n={copied ? "check" : "link"} s={13} c={copied ? "#22c55e" : "#3b82f6"} />
              {copied ? "Link Copied!" : "Copy Bot Link to Share"}
            </button>

            <label style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "#444456", marginBottom: 6, display: "block" }}>Your Telegram Chat ID</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <input value={tgChatId} onChange={(e) => setTgId(e.target.value)} placeholder="e.g. 123456789"
                style={{ flex: 1, background: "#0a0a0c", border: "1px solid #2e2e35", borderRadius: 8, padding: "10px 12px", fontSize: 13, fontWeight: 600, color: "#f0f0f5", fontFamily: "monospace", outline: "none", boxSizing: "border-box" }} />
              <button onClick={saveTelegramId} disabled={tgSaving}
                style={{ background: tgSaved ? "rgba(34,197,94,.1)" : "#22c55e", border: tgSaved ? "1px solid rgba(34,197,94,.3)" : "none", borderRadius: 8, padding: "10px 16px", fontSize: 12, fontWeight: 700, color: tgSaved ? "#22c55e" : "#000", cursor: tgSaving ? "not-allowed" : "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
                {tgSaving ? "Saving…" : tgSaved ? "Saved! ✓" : "Save"}
              </button>
            </div>

            {user?.telegramChatId && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#22c55e", fontWeight: 600, marginBottom: 14 }}>
                <Ic n="check" s={12} c="#22c55e" /> Connected — Chat ID: <span style={{ fontFamily: "monospace" }}>{user.telegramChatId}</span>
              </div>
            )}

            <div style={{ padding: "12px 14px", background: "#111114", border: "1px solid #242428", borderRadius: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "#444456", marginBottom: 10 }}>Available Bot Commands</div>
              {[
                { cmd: "/start",   desc: "Get your Chat ID" },
                { cmd: "/balance", desc: "Check wallet balances" },
                { cmd: "/spent",   desc: "Monthly spending summary" },
                { cmd: "/budget",  desc: "Budget progress + zone" },
                { cmd: "/xp",      desc: "Your XP and level" },
                { cmd: "/rank",    desc: "Your saver rank" },
                { cmd: "/help",    desc: "Show all commands" },
              ].map((c, i, arr) => (
                <div key={c.cmd} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: i < arr.length - 1 ? "1px solid #242428" : "none", alignItems: "center" }}>
                  <span style={{ fontFamily: "monospace", fontSize: 12, color: "#3b82f6", fontWeight: 600 }}>{c.cmd}</span>
                  <span style={{ fontSize: 11, color: "#444456" }}>{c.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </Sec>
      )}

      {/* ── SETTINGS ── */}
      {ptab === "settings" && (
        <>
          <Sec title="Budget Goals">
            <div style={{ padding: "12px 15px", borderBottom: "1px solid #242428" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: editGoal ? 10 : 0 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(34,197,94,.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Ic n="target" s={14} c="#22c55e" /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>Monthly Goal</div>
                  <div style={{ fontSize: 10, color: "#444456", marginTop: 1 }}>Ideal spending target</div>
                </div>
                {!editGoal ? (
                  <button onClick={() => { setEditGoal(true); setGoalVal(String(user?.goalBudget || 175000)); }}
                    style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "1px solid #2e2e35", borderRadius: 7, padding: "5px 12px", fontSize: 11, fontWeight: 600, color: "#22c55e", cursor: "pointer", fontFamily: "inherit" }}>
                    <span style={{ fontFamily: "monospace" }}>{(user?.goalBudget || 175000).toLocaleString()} MMK</span>
                    <Ic n="edit" s={11} c="#22c55e" />
                  </button>
                ) : (
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => setEditGoal(false)} style={{ background: "none", border: "1px solid #2e2e35", borderRadius: 7, padding: "5px 10px", fontSize: 11, color: "#444456", cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                    <button onClick={saveGoalBudget} disabled={goalSaving} style={{ background: "#22c55e", border: "none", borderRadius: 7, padding: "5px 12px", fontSize: 11, fontWeight: 700, color: "#000", cursor: "pointer", fontFamily: "inherit" }}>{goalSaving ? "Saving…" : "Save"}</button>
                  </div>
                )}
              </div>
              {editGoal && (
                <div style={{ marginLeft: 44 }}>
                  <input type="number" value={goalVal} onChange={(e) => setGoalVal(e.target.value)} autoFocus onKeyDown={(e) => e.key === "Enter" && saveGoalBudget()}
                    style={{ width: "100%", background: "#0a0a0c", border: "1px solid rgba(34,197,94,.4)", borderRadius: 8, padding: "10px 12px", fontSize: 16, fontWeight: 700, color: "#22c55e", fontFamily: "monospace", outline: "none", boxSizing: "border-box" }} />
                  <div style={{ fontSize: 10, color: "#444456", marginTop: 4 }}>Your ideal monthly spending. Press Enter to save.</div>
                </div>
              )}
              {goalSaved && !editGoal && <div style={{ fontSize: 10, color: "#22c55e", marginTop: 4, marginLeft: 44, display: "flex", alignItems: "center", gap: 4 }}><Ic n="check" s={10} c="#22c55e" /> Saved!</div>}
            </div>

            <div style={{ padding: "12px 15px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: editEmer ? 10 : 0 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(245,158,11,.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Ic n="warn" s={14} c="#f59e0b" /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>Emergency Limit</div>
                  <div style={{ fontSize: 10, color: "#444456", marginTop: 1 }}>Max allowed to spend</div>
                </div>
                {!editEmer ? (
                  <button onClick={() => { setEditEmer(true); setEmerVal(String(user?.emergencyLimit || 225000)); }}
                    style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "1px solid #2e2e35", borderRadius: 7, padding: "5px 12px", fontSize: 11, fontWeight: 600, color: "#f59e0b", cursor: "pointer", fontFamily: "inherit" }}>
                    <span style={{ fontFamily: "monospace" }}>{(user?.emergencyLimit || 225000).toLocaleString()} MMK</span>
                    <Ic n="edit" s={11} c="#f59e0b" />
                  </button>
                ) : (
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => setEditEmer(false)} style={{ background: "none", border: "1px solid #2e2e35", borderRadius: 7, padding: "5px 10px", fontSize: 11, color: "#444456", cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                    <button onClick={saveEmerLimit} disabled={goalSaving} style={{ background: "#f59e0b", border: "none", borderRadius: 7, padding: "5px 12px", fontSize: 11, fontWeight: 700, color: "#000", cursor: "pointer", fontFamily: "inherit" }}>{goalSaving ? "Saving…" : "Save"}</button>
                  </div>
                )}
              </div>
              {editEmer && (
                <div style={{ marginLeft: 44 }}>
                  <input type="number" value={emerVal} onChange={(e) => setEmerVal(e.target.value)} autoFocus onKeyDown={(e) => e.key === "Enter" && saveEmerLimit()}
                    style={{ width: "100%", background: "#0a0a0c", border: "1px solid rgba(245,158,11,.4)", borderRadius: 8, padding: "10px 12px", fontSize: 16, fontWeight: 700, color: "#f59e0b", fontFamily: "monospace", outline: "none", boxSizing: "border-box" }} />
                  <div style={{ fontSize: 10, color: "#444456", marginTop: 4 }}>Must be higher than Goal Budget. Press Enter to save.</div>
                </div>
              )}
            </div>
          </Sec>

          <Sec title="Data">
            <div onClick={exportCSV} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 15px", cursor: "pointer" }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "#242428", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Ic n="download" s={14} c="#8888a0" /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>Export Transactions</div>
                <div style={{ fontSize: 10, color: "#444456", marginTop: 1 }}>Download all transactions as CSV</div>
              </div>
              <Ic n="chevron" s={12} c="#444456" />
            </div>
          </Sec>
        </>
      )}

      {/* ── SECURITY ── */}
      {ptab === "security" && (
        <>
          <Sec title="Authentication">
            {/* Change Password */}
            <div style={{ padding: "12px 15px", borderBottom: "1px solid #242428" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: showChangePw ? 14 : 0 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(34,197,94,.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Ic n="lock" s={14} c="#22c55e" /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>Change Password</div>
                  <div style={{ fontSize: 10, color: "#444456", marginTop: 1 }}>Update your account password</div>
                </div>
                <button onClick={() => { setShowChangePw(!showChangePw); setPwMsg({ text: "", ok: false }); }}
                  style={{ background: "none", border: "1px solid #2e2e35", borderRadius: 7, padding: "5px 10px", fontSize: 11, color: "#f0f0f5", cursor: "pointer", fontFamily: "inherit" }}>
                  {showChangePw ? "Cancel" : "Change"}
                </button>
              </div>
              {showChangePw && (
                <div style={{ marginLeft: 44, display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { label: "Current Password", val: currentPw, set: setCurrentPw },
                    { label: "New Password",      val: newPw,     set: setNewPw     },
                    { label: "Confirm Password",  val: confirmPw, set: setConfirmPw },
                  ].map((f) => (
                    <div key={f.label}>
                      <label style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: "#444456", marginBottom: 4, display: "block" }}>{f.label}</label>
                      <input type="password" value={f.val} onChange={(e) => f.set(e.target.value)}
                        style={{ width: "100%", background: "#0a0a0c", border: "1px solid #2e2e35", borderRadius: 7, padding: "9px 11px", fontSize: 13, color: "#f0f0f5", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
                    </div>
                  ))}
                  {pwMsg.text && <div style={{ fontSize: 11, color: pwMsg.ok ? "#22c55e" : "#ef4444", display: "flex", alignItems: "center", gap: 5 }}><Ic n={pwMsg.ok ? "check" : "warn"} s={11} c={pwMsg.ok ? "#22c55e" : "#ef4444"} />{pwMsg.text}</div>}
                  <button onClick={changePassword} disabled={pwSaving}
                    style={{ background: "#22c55e", border: "none", borderRadius: 8, padding: "10px", fontSize: 12, fontWeight: 700, color: "#000", cursor: pwSaving ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: pwSaving ? .7 : 1 }}>
                    {pwSaving ? "Changing…" : "Update Password"}
                  </button>
                </div>
              )}
            </div>

            <SRow icon="shield" iconColor="#f59e0b" iconBg="rgba(245,158,11,.1)" name="Two-Factor Auth" desc="Extra security layer (coming soon)" right={<Toggle on={twoFA} onToggle={() => setTwoFA(!twoFA)} />} />
          </Sec>

          <Sec title="Danger Zone" danger>
            {/* Reset XP */}
            <div style={{ padding: "12px 15px", borderBottom: "1px solid #242428" }}>
              {!showResetConf ? (
                <button onClick={() => setShowResetConf(true)} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 500, color: "#ef4444", width: "100%", padding: 0 }}>
                  <Ic n="refresh" s={13} c="#ef4444" /> Reset all XP and progress
                </button>
              ) : (
                <div>
                  <div style={{ fontSize: 12, color: "#ef4444", marginBottom: 10, fontWeight: 600 }}>This will reset your level, XP, streak, and rank to zero. Are you sure?</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => setShowResetConf(false)} style={{ flex: 1, background: "none", border: "1px solid #2e2e35", borderRadius: 7, padding: "8px", fontSize: 12, color: "#444456", cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                    <button onClick={resetXP} disabled={resetting} style={{ flex: 1, background: "#ef4444", border: "none", borderRadius: 7, padding: "8px", fontSize: 12, fontWeight: 700, color: "#fff", cursor: "pointer", fontFamily: "inherit" }}>{resetting ? "Resetting…" : "Yes, Reset"}</button>
                  </div>
                </div>
              )}
            </div>

            {/* Delete Account */}
            <div style={{ padding: "12px 15px" }}>
              {!showDeleteConf ? (
                <button onClick={() => setShowDeleteConf(true)} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 500, color: "#ef4444", width: "100%", padding: 0 }}>
                  <Ic n="trash" s={13} c="#ef4444" /> Delete account permanently
                </button>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ fontSize: 12, color: "#ef4444", fontWeight: 600 }}>This is permanent. All data will be deleted.</div>
                  <div>
                    <label style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: "#444456", marginBottom: 4, display: "block" }}>Type DELETE to confirm</label>
                    <input value={deleteConfText} onChange={(e) => setDeleteConfText(e.target.value)} placeholder="DELETE"
                      style={{ width: "100%", background: "#0a0a0c", border: "1px solid #ef4444", borderRadius: 7, padding: "9px 11px", fontSize: 13, color: "#ef4444", fontFamily: "monospace", outline: "none", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: "#444456", marginBottom: 4, display: "block" }}>Your Password</label>
                    <input type="password" value={deletePw} onChange={(e) => setDeletePw(e.target.value)}
                      style={{ width: "100%", background: "#0a0a0c", border: "1px solid #2e2e35", borderRadius: 7, padding: "9px 11px", fontSize: 13, color: "#f0f0f5", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => { setShowDeleteConf(false); setDeleteConfText(""); setDeletePw(""); }} style={{ flex: 1, background: "none", border: "1px solid #2e2e35", borderRadius: 7, padding: "8px", fontSize: 12, color: "#444456", cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                    <button onClick={deleteAccount} disabled={deleting || deleteConfText !== "DELETE"} style={{ flex: 1, background: "#ef4444", border: "none", borderRadius: 7, padding: "8px", fontSize: 12, fontWeight: 700, color: "#fff", cursor: "pointer", fontFamily: "inherit", opacity: deleteConfText !== "DELETE" ? .4 : 1 }}>{deleting ? "Deleting…" : "Delete Forever"}</button>
                  </div>
                </div>
              )}
            </div>
          </Sec>
        </>
      )}
    </div>
  );
}
// ─── TABS ─────────────────────────────────────────────────────────────────────
const TABS = [
  { id: "home",      label: "Home",      icon: "home"      },
  { id: "wallet",    label: "Wallet",    icon: "wallet"    },
  { id: "goals",     label: "Goals",     icon: "target"    },
  { id: "game",      label: "Game",      icon: "game"      },
  { id: "analytics", label: "Analytics", icon: "analytics" },
  { id: "profile",   label: "Profile",   icon: "user"      },
];

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, logout, updateUserProfile } = useAuth();
  const txData  = useTransactions(user);
  const [tab,             setTab]    = useState("home");
  const [modal,           setModal]  = useState(false);
  // Wallet balances stored locally + Firestore
  const [walletBalances,  setWBals]  = useState<Record<string, number>>({});

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) router.replace("/auth");
  }, [user, loading, router]);

  // Load wallet balances from Firestore
  useEffect(() => {
    if (!user?.uid) return;
    const load = async () => {
      try {
        const ref  = doc(db, "walletBalances", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) setWBals(snap.data() as Record<string, number>);
      } catch (e) { console.error(e); }
    };
    load();
  }, [user?.uid]);

  const updateWalletBalance = async (walletId: string, amount: number) => {
    if (!user?.uid) return;
    const next = { ...walletBalances, [walletId]: amount };
    setWBals(next);
    try {
      await setDoc(doc(db, "walletBalances", user.uid), next);
    } catch (e) { console.error(e); }
  };

  if (loading) {
    return (
      <div style={{ background: "#0a0a0c", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#444456", fontSize: 12, fontFamily: "monospace" }}>Loading…</div>
      </div>
    );
  }
  if (!user) return null;

  const handleLogout = () => {
    router.replace("/auth");
    logout();
  };

  const handleAdd = async (name: string, amount: number, cat: string, wallet: string) => {
    await txData.addCashTransaction(name, amount, cat, wallet);
    // Deduct from wallet balance if set
    if (walletBalances[wallet]) {
      await updateWalletBalance(wallet, Math.max(0, walletBalances[wallet] - amount));
    }
  };

  const xpPct = Math.min((user.xp || 0) % 100, 100);

  return (
    <div style={{ background: "#0a0a0c", fontFamily: "'Inter', sans-serif", color: "#f0f0f5", minHeight: "100vh" }}>
      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.2} }
        @keyframes spin   { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        input::placeholder { color: #444456; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0a0a0c; }
        ::-webkit-scrollbar-thumb { background: #2e2e35; border-radius: 2px; }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", background: "#111114", borderBottom: "1px solid #242428", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 15, fontWeight: 700, letterSpacing: ".05em" }}>
          MMK<span style={{ color: "#22c55e" }}>Quest</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <div style={{ fontSize: 9, color: "#444456", fontFamily: "monospace" }}>XP {(user.xp || 0) % 100}/100</div>
            <div style={{ width: 90, height: 3, background: "#242428", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${xpPct}%`, background: "#22c55e", borderRadius: 2 }} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(168,85,247,.1)", border: "1px solid rgba(168,85,247,.25)", borderRadius: 20, padding: "5px 10px", fontSize: 11, fontWeight: 500, color: "#a855f7" }}>
            <Ic n="star" s={10} c="#a855f7" /> Lv {user.level || 1}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(245,158,11,.1)", border: "1px solid rgba(245,158,11,.25)", borderRadius: 20, padding: "5px 10px", fontSize: 11, fontWeight: 500, color: "#f59e0b" }}>
            <Ic n="zap" s={10} c="#f59e0b" /> {user.streak || 0}d
          </div>
          <button onClick={() => setModal(true)} style={{ display: "flex", alignItems: "center", gap: 6, background: "#22c55e", color: "#000", border: "none", borderRadius: 8, padding: "7px 13px", fontSize: 11, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit" }}>
            <Ic n="plus" s={12} c="#000" /> Add Spend
          </button>
        </div>
      </div>

      {/* Nav */}
      <div style={{ display: "flex", background: "#111114", borderBottom: "1px solid #242428", padding: "0 20px", position: "sticky", top: 52, zIndex: 49, overflowX: "auto" }}>
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "11px 13px", fontSize: 10, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: tab === t.id ? "#f0f0f5" : "#444456", cursor: "pointer", background: "none", border: "none", borderBottom: `1.5px solid ${tab === t.id ? "#22c55e" : "transparent"}`, fontFamily: "inherit", marginBottom: -1, whiteSpace: "nowrap" }}>
            <Ic n={t.icon} s={11} c={tab === t.id ? "#f0f0f5" : "#444456"} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ maxHeight: "calc(100vh - 96px)", overflowY: "auto" }}>
        {tab === "home"      && <HomeScreen      user={user} txData={txData} walletBalances={walletBalances} />}
        {tab === "wallet"    && <WalletScreen    walletBalances={walletBalances} onUpdateBalance={updateWalletBalance} txData={txData} />}
        {tab === "goals"     && <GoalsScreen     user={user} txData={txData} updateUser={updateUserProfile} />}
        {tab === "game"      && <GameScreen      user={user} />}
        {tab === "analytics" && <AnalyticsScreen txData={txData} />}
        {tab === "profile"   && <ProfileScreen   user={user} onLogout={handleLogout} updateUser={updateUserProfile} txData={txData} />}
      </div>

      <AddSpendModal open={modal} onClose={() => setModal(false)} onAdd={handleAdd} walletBalances={walletBalances} />
    </div>
  );
}

function updateUser(arg0: { telegramChatId: any; }) {
  throw new Error("Function not implemented.");
}
