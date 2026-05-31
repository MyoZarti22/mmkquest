// app/dashboard/page.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useTransactions, WALLETS, CAT_COLORS, CAT_ICONS } from "@/hooks/useTransactions";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// ─── ICON ─────────────────────────────────────────────────────────────────────
function Ic({ n, s = 14, c = "currentColor", sw = 2 }: { n: string; s?: number; c?: string; sw?: number }) {
  const p: Record<string, React.ReactNode> = {
    home:     <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    wallet:   <><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></>,
    target:   <><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>,
    game:     <><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></>,
    user:     <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
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
    edit:     <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
    trophy:   <><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></>,
    logout:   <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
    refresh:  <><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></>,
    warn:     <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
    send:     <><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></>,
    sun:      <><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></>,
    trash:    <><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
    food:     <path d="M3 11l19-9-9 19-2-8-8-2z"/>,
    bus:      <><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></>,
    shop:     <><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></>,
    bill:     <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></>,
    gaming:   <><rect x="6" y="11" width="12" height="10" rx="2"/><path d="M6 11V9a6 6 0 0 1 12 0v2"/></>,
    coin:     <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>,
    chevron:  <polyline points="9 18 15 12 9 6"/>,
    health:   <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>,
    phone:    <><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></>,
  };
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={sw}
      strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      {p[n]}
    </svg>
  );
}

// ─── SMALL REUSABLE PIECES ────────────────────────────────────────────────────
const Lbl = ({ icon, children }: { icon?: string; children: React.ReactNode }) => (
  <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color: "#444456", marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
    {icon && <Ic n={icon} s={10} c="#444456" />} {children}
  </div>
);

const LiveDot = () => (
  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block", marginLeft: 4, animation: "blink 1.2s ease-in-out infinite" }} />
);

const Card = ({ children, style = {}, full = false }: any) => (
  <div style={{ background: "#161619", border: "1px solid #242428", borderRadius: 10, padding: "13px 15px", gridColumn: full ? "1/-1" : undefined, ...style }}>
    {children}
  </div>
);

const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
  <div onClick={onToggle} style={{ width: 38, height: 21, borderRadius: 11, background: on ? "#22c55e" : "#2e2e35", position: "relative", cursor: "pointer", transition: "background .2s", flexShrink: 0 }}>
    <div style={{ position: "absolute", top: 3, left: on ? 20 : 3, width: 15, height: 15, borderRadius: "50%", background: "#f0f0f5", transition: "left .2s" }} />
  </div>
);

const StatBox = ({ val, lbl, color = "#f0f0f5" }: { val: string; lbl: string; color?: string }) => (
  <div style={{ background: "#111114", border: "1px solid #242428", borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
    <div style={{ fontFamily: "monospace", fontSize: 17, fontWeight: 700, color, lineHeight: 1 }}>{val}</div>
    <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "#444456", marginTop: 3 }}>{lbl}</div>
  </div>
);

// ─── ADD SPEND MODAL ──────────────────────────────────────────────────────────
function AddSpendModal({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: (name: string, amount: number, cat: string, wallet: string) => Promise<void> }) {
  const [amt,     setAmt]     = useState("");
  const [desc,    setDesc]    = useState("");
  const [cat,     setCat]     = useState("food");
  const [wallet,  setWallet]  = useState("cash");
  const [busy,    setBusy]    = useState(false);
  const [success, setSuccess] = useState(false);
  const [errs,    setErrs]    = useState<Record<string,boolean>>({});

  const CATS = [
    { id: "food", icon: "food" }, { id: "gaming", icon: "gaming" },
    { id: "transport", icon: "bus" }, { id: "shopping", icon: "shop" },
    { id: "bills", icon: "bill" }, { id: "other", icon: "coin" },
  ];

  const reset = () => { setAmt(""); setDesc(""); setCat("food"); setWallet("cash"); setBusy(false); setSuccess(false); setErrs({}); };

  const submit = async () => {
    const e: Record<string,boolean> = {};
    if (!amt || isNaN(Number(amt))) e.amt = true;
    if (!desc.trim()) e.desc = true;
    if (Object.keys(e).length) { setErrs(e); return; }
    setBusy(true);
    try {
      await onAdd(desc, Number(amt), cat, wallet);
      setSuccess(true);
      setTimeout(() => { reset(); onClose(); }, 1600);
    } catch { setBusy(false); }
  };

  if (!open) return null;

  return (
    <div onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.8)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#161619", border: "1px solid #2e2e35", borderRadius: 14, padding: 24, width: 360, maxWidth: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
            <Ic n="plus" s={15} c="#22c55e" /> Add Cash Expense
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex" }}>
            <Ic n="x" s={16} c="#444456" />
          </button>
        </div>

        {/* Amount */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "#444456", marginBottom: 5, display: "block" }}>Amount (MMK)</label>
          <input value={amt} onChange={(e) => { setAmt(e.target.value); setErrs((v) => ({ ...v, amt: false })); }}
            style={{ width: "100%", background: "#0a0a0c", border: `1px solid ${errs.amt ? "#ef4444" : "#2e2e35"}`, borderRadius: 7, padding: "10px 12px", fontSize: 18, fontWeight: 700, color: "#f0f0f5", fontFamily: "monospace", outline: "none", boxSizing: "border-box" as any }}
            type="number" placeholder="3,500" />
          {errs.amt && <div style={{ fontSize: 10, color: "#ef4444", marginTop: 3 }}>Enter a valid amount</div>}
        </div>

        {/* Description */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "#444456", marginBottom: 5, display: "block" }}>Description</label>
          <input value={desc} onChange={(e) => { setDesc(e.target.value); setErrs((v) => ({ ...v, desc: false })); }}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            style={{ width: "100%", background: "#0a0a0c", border: `1px solid ${errs.desc ? "#ef4444" : "#2e2e35"}`, borderRadius: 7, padding: "10px 12px", fontSize: 13, fontWeight: 500, color: "#f0f0f5", fontFamily: "inherit", outline: "none", boxSizing: "border-box" as any }}
            placeholder="e.g. Shan noodles at Victory" />
          {errs.desc && <div style={{ fontSize: 10, color: "#ef4444", marginTop: 3 }}>Description is required</div>}
        </div>

        {/* Category */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "#444456", marginBottom: 5, display: "block" }}>Category</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 5 }}>
            {CATS.map((c) => (
              <div key={c.id} onClick={() => setCat(c.id)}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "8px 5px", background: cat === c.id ? "rgba(34,197,94,.1)" : "#111114", border: `1px solid ${cat === c.id ? "rgba(34,197,94,.35)" : "#2e2e35"}`, borderRadius: 7, cursor: "pointer", fontSize: 10, fontWeight: 500, color: cat === c.id ? "#22c55e" : "#8888a0", textTransform: "capitalize", transition: "all .15s" }}>
                <Ic n={c.icon} s={14} c={cat === c.id ? "#22c55e" : "#8888a0"} />
                {c.id}
              </div>
            ))}
          </div>
        </div>

        {/* Wallet */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "#444456", marginBottom: 5, display: "block" }}>
            Wallet / Payment <span style={{ color: "#3b82f6", fontStyle: "normal", textTransform: "none", letterSpacing: 0, fontWeight: 400 }}>(Select where you're paying from)</span>
          </label>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" as any }}>
            {WALLETS.map((w) => (
              <div key={w.id} onClick={() => setWallet(w.id)}
                style={{ padding: "5px 10px", background: wallet === w.id ? "rgba(34,197,94,.1)" : "#111114", border: `1px solid ${wallet === w.id ? "rgba(34,197,94,.35)" : "#2e2e35"}`, borderRadius: 20, fontSize: 10, fontWeight: 600, color: wallet === w.id ? "#22c55e" : "#8888a0", cursor: "pointer", transition: "all .15s" }}>
                {w.short}
              </div>
            ))}
          </div>
        </div>

        <button onClick={submit} disabled={busy || success}
          style={{ width: "100%", background: "#22c55e", border: "none", borderRadius: 8, padding: "11px", fontSize: 13, fontWeight: 700, color: "#000", cursor: "pointer", fontFamily: "inherit", opacity: busy ? .7 : 1 }}>
          {busy ? "Saving…" : "Log Expense"}
        </button>

        {success && (
          <div style={{ textAlign: "center", marginTop: 10, fontSize: 12, fontWeight: 600, color: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
            <Ic n="check" s={12} c="#22c55e" /> Saved to Firestore — +15 XP earned!
          </div>
        )}
      </div>
    </div>
  );
}

// ─── HOME SCREEN ──────────────────────────────────────────────────────────────
function HomeScreen({ user, txData }: any) {
  const { transactions, totalSpent, totalIncome, totalBalance, categoryTotals, budgetPct, zone, projectedXP } = txData;
  const [alertOpen, setAlertOpen] = useState(true);
  const goal = user?.goalBudget || 175000;
  const emergency = user?.emergencyLimit || 225000;
  const zoneColor = zone === "safe" ? "#22c55e" : zone === "warn" ? "#f59e0b" : "#ef4444";
  const maxCat = Math.max(...Object.values(categoryTotals as Record<string,number>), 1);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 11, padding: "16px 20px" }}>
      {alertOpen && zone !== "safe" && (
        <div style={{ gridColumn: "1/-1", background: `${zoneColor}10`, border: `1px solid ${zoneColor}30`, borderRadius: 8, padding: "9px 13px", display: "flex", alignItems: "center", gap: 9 }}>
          <Ic n="warn" s={13} c={zoneColor} />
          <span style={{ fontSize: 11, fontWeight: 500, color: zoneColor, flex: 1 }}>
            {Math.round(budgetPct)}% of monthly budget used — {zone === "danger" ? "Emergency limit exceeded!" : "Stay focused!"}
          </span>
          <button onClick={() => setAlertOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
            <Ic n="x" s={12} c="#444456" />
          </button>
        </div>
      )}

      {/* Stats */}
      <Card><Lbl icon="dollar">Balance</Lbl><div style={{ fontFamily: "monospace", fontSize: 20, fontWeight: 700, color: "#22c55e" }}>{totalBalance.toLocaleString()}</div><div style={{ fontSize: 10, color: "#444456", marginTop: 3, fontFamily: "monospace" }}>MMK</div><div style={{ fontSize: 10, color: "#22c55e", marginTop: 5, fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}><Ic n="trending" s={9} c="#22c55e" />5 wallets</div></Card>
      <Card><Lbl icon="trending">Income</Lbl><div style={{ fontFamily: "monospace", fontSize: 20, fontWeight: 700, color: "#3b82f6" }}>{totalIncome.toLocaleString()}</div><div style={{ fontSize: 10, color: "#444456", marginTop: 3, fontFamily: "monospace" }}>MMK this month</div></Card>
      <Card><Lbl icon="wallet">Spent</Lbl><div style={{ fontFamily: "monospace", fontSize: 20, fontWeight: 700, color: "#f59e0b" }}>{totalSpent.toLocaleString()}</div><div style={{ fontSize: 10, color: "#444456", marginTop: 3, fontFamily: "monospace" }}>of {goal.toLocaleString()} goal</div></Card>

      {/* Budget Meter */}
      <Card full>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 0 }}>
          <Lbl icon="bar" style={{ margin: 0 }}>Budget Meter<LiveDot /></Lbl>
          <span style={{ fontSize: 10, color: "#444456" }}>+{projectedXP} XP projected</span>
        </div>
        <div style={{ height: 7, background: "#242428", borderRadius: 4, marginTop: 10, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${budgetPct}%`, background: zoneColor, borderRadius: 4, transition: "width .5s" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5, fontSize: 9, fontFamily: "monospace" }}>
          <span style={{ color: "#444456" }}>0</span>
          <span style={{ color: "#22c55e" }}>Goal {(goal/1000).toFixed(0)}K</span>
          <span style={{ color: "#f59e0b" }}>Emergency {(emergency/1000).toFixed(0)}K</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 7, fontSize: 10, fontWeight: 600 }}>
          <span style={{ color: zoneColor }}>{zone === "safe" ? "Perfect Save Zone!" : zone === "warn" ? "Safe Zone — above goal, below emergency" : "DANGER — Over Emergency Limit!"}</span>
        </div>
      </Card>

      {/* Weekly chart */}
      <Card style={{ gridColumn: "span 2" }}>
        <Lbl icon="bar">Weekly Spending</Lbl>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 48, marginTop: 8 }}>
          {[52, 71, 38, 88, 100, 44, 61].map((h, i) => (
            <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: "2px 2px 0 0", background: h === 100 ? "#ef4444" : i === 6 ? "#22c55e" : "#2e2e35" }} />
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          {["M","T","W","T","F","S","S"].map((d, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center", fontSize: 9, color: i === 6 ? "#22c55e" : "#444456", fontFamily: "monospace" }}>{d}</div>
          ))}
        </div>
      </Card>

      {/* Savings ring */}
      <Card>
        <Lbl icon="target">Savings</Lbl>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, marginTop: 4 }}>
          <svg width="76" height="76" viewBox="0 0 76 76">
            <circle cx="38" cy="38" r="30" fill="none" stroke="#242428" strokeWidth="7" />
            <circle cx="38" cy="38" r="30" fill="none" stroke="#22c55e" strokeWidth="7" strokeLinecap="round" strokeDasharray="188" strokeDashoffset="53" transform="rotate(-90 38 38)" />
            <text x="38" y="38" textAnchor="middle" dy="5" fontFamily="monospace" fontSize="13" fontWeight="700" fill="#22c55e">72%</text>
          </svg>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 600, color: "#22c55e" }}>225K / 312K MMK</div>
            <div style={{ fontSize: 10, color: "#444456", marginTop: 2 }}>saved this month</div>
          </div>
        </div>
      </Card>

      {/* Categories */}
      <Card style={{ gridColumn: "span 2" }}>
        <Lbl icon="bar">Spending by Category</Lbl>
        <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 6 }}>
          {Object.entries(categoryTotals).slice(0, 4).map(([cat, val]) => (
            <div key={cat} style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <div style={{ width: 26, height: 26, borderRadius: 6, background: `${CAT_COLORS[cat]}18`, border: `1px solid ${CAT_COLORS[cat]}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Ic n={CAT_ICONS[cat] || "coin"} s={12} c={CAT_COLORS[cat]} />
              </div>
              <div style={{ fontSize: 11, color: "#8888a0", width: 66, flexShrink: 0, textTransform: "capitalize" }}>{cat}</div>
              <div style={{ flex: 1, height: 4, background: "#242428", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${((val as number) / maxCat) * 100}%`, background: CAT_COLORS[cat], borderRadius: 2 }} />
              </div>
              <div style={{ fontSize: 10, fontFamily: "monospace", color: "#444456", width: 32, textAlign: "right" }}>{totalSpent ? Math.round(((val as number) / totalSpent) * 100) : 0}%</div>
            </div>
          ))}
          {Object.keys(categoryTotals).length === 0 && (
            <div style={{ fontSize: 12, color: "#444456", textAlign: "center", padding: "12px 0" }}>No expenses yet — add your first cash spend!</div>
          )}
        </div>
      </Card>

      {/* Boss */}
      <Card>
        <Lbl icon="game">Active Boss</Lbl>
        <div style={{ background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.25)", borderRadius: 8, padding: "10px 12px", marginTop: 4 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#ef4444", marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
            <Ic n="star" s={12} c="#ef4444" /> Food Monster Lv.5
          </div>
          <div style={{ height: 5, background: "rgba(239,68,68,.15)", borderRadius: 3, overflow: "hidden", marginBottom: 4 }}>
            <div style={{ height: "100%", width: "65%", background: "#ef4444", borderRadius: 3 }} />
          </div>
          <div style={{ fontSize: 10, color: "#444456" }}>Reduce food by 15,000 MMK</div>
        </div>
      </Card>

      {/* Transactions */}
      <Card full>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <Lbl icon="wallet" style={{ margin: 0 }}>Recent Transactions<LiveDot /></Lbl>
        </div>
        {transactions.length === 0 ? (
          <div style={{ fontSize: 12, color: "#444456", textAlign: "center", padding: "16px 0" }}>No transactions yet. Add your first expense above!</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {transactions.slice(0, 6).map((tx: any) => (
              <div key={tx.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: "#111114", border: "1px solid #242428", borderRadius: 8 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: `${CAT_COLORS[tx.category]}18`, border: `1px solid ${CAT_COLORS[tx.category]}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Ic n={CAT_ICONS[tx.category] || "coin"} s={13} c={CAT_COLORS[tx.category]} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>{tx.name}</div>
                  <div style={{ fontSize: 10, color: "#444456", marginTop: 1, textTransform: "capitalize" }}>{tx.category} · {WALLETS.find((w) => w.id === tx.wallet)?.name}</div>
                </div>
                <div>
                  <div style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: tx.type === "income" ? "#22c55e" : "#ef4444", textAlign: "right" }}>
                    {tx.type === "income" ? "+" : ""}{tx.amount.toLocaleString()} MMK
                  </div>
                  <div style={{ fontSize: 9, color: "#444456", fontFamily: "monospace", textAlign: "right", marginTop: 2 }}>
                    {new Date(tx.timestamp).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── WALLET SCREEN ────────────────────────────────────────────────────────────
function WalletScreen({ txData }: any) {
  const { transactions, categoryTotals, totalSpent } = txData;
  const maxCat = Math.max(...Object.values(categoryTotals as Record<string,number>), 1);
  return (
    <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
      <Card>
        <Lbl icon="wallet">Myanmar Wallets & Banks</Lbl>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {WALLETS.map((w) => (
            <div key={w.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 13px", background: "#111114", border: `1px solid ${w.status === "connected" && w.id !== "cash" ? `${w.color}30` : "#242428"}`, borderRadius: 9, cursor: "pointer" }}>
              <div style={{ width: 34, height: 34, background: `${w.color}18`, border: `1px solid ${w.color}40`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Ic n="wallet" s={15} c={w.color} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{w.name}</div>
                <div style={{ fontSize: 10, color: w.id === "cash" ? "#8888a0" : "#22c55e", marginTop: 1 }}>
                  {w.id === "cash" ? "Manual entry only — used for cash expenses" : `Connected · Syncing`}
                </div>
              </div>
              <div style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: w.id === "cash" ? "#444456" : w.color }}>
                {w.id === "cash" ? "--" : `${w.balance.toLocaleString()} MMK`}
              </div>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: w.id === "cash" ? "#f59e0b" : "#22c55e" }} />
            </div>
          ))}
        </div>
      </Card>

      <Card style={{ background: "rgba(34,197,94,.04)", border: "1px solid rgba(34,197,94,.18)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "#22c55e", marginBottom: 4 }}>Total Across All Wallets</div>
            <div style={{ fontFamily: "monospace", fontSize: 26, fontWeight: 700, color: "#22c55e" }}>{WALLETS.reduce((a, w) => a + w.balance, 0).toLocaleString()} <span style={{ fontSize: 14 }}>MMK</span></div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, color: "#444456", marginBottom: 4 }}>5 connected wallets</div>
            <div style={{ fontSize: 10, color: "#22c55e" }}>+ Cash (manual)</div>
          </div>
        </div>
      </Card>

      <Card>
        <Lbl icon="health">Integration Phases</Lbl>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            { phase: "Phase 1", label: "Manual Entry", status: "ACTIVE", color: "#22c55e" },
            { phase: "Phase 2", label: "Email Parsing", status: "ACTIVE", color: "#22c55e" },
            { phase: "Phase 3", label: "SMS Parsing", status: "BETA", color: "#f59e0b" },
            { phase: "Phase 4", label: "Official APIs", status: "PLANNED", color: "#444456" },
          ].map((p) => (
            <div key={p.phase} style={{ background: "#111114", border: `1px solid ${p.color}30`, borderRadius: 8, padding: "9px 11px" }}>
              <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: p.color, marginBottom: 3 }}>{p.phase}</div>
              <div style={{ fontSize: 12, fontWeight: 500 }}>{p.label}</div>
              <div style={{ fontSize: 9, fontWeight: 600, color: p.color, marginTop: 3, textTransform: "uppercase" }}>{p.status}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <Lbl icon="bar">Spending by Category</Lbl>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
          {Object.entries(categoryTotals).length === 0 ? (
            <div style={{ fontSize: 12, color: "#444456", textAlign: "center", padding: "8px 0" }}>No expenses yet</div>
          ) : Object.entries(categoryTotals).map(([cat, val]) => (
            <div key={cat} style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <div style={{ width: 26, height: 26, borderRadius: 6, background: `${CAT_COLORS[cat]}18`, border: `1px solid ${CAT_COLORS[cat]}40`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Ic n={CAT_ICONS[cat] || "coin"} s={12} c={CAT_COLORS[cat]} />
              </div>
              <div style={{ fontSize: 11, color: "#8888a0", width: 66, flexShrink: 0, textTransform: "capitalize" }}>{cat}</div>
              <div style={{ flex: 1, height: 4, background: "#242428", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${((val as number) / maxCat) * 100}%`, background: CAT_COLORS[cat], borderRadius: 2 }} />
              </div>
              <div style={{ fontSize: 10, fontFamily: "monospace", color: "#444456", width: 52, textAlign: "right" }}>{(val as number).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <Lbl icon="wallet">All Transactions</Lbl>
        {transactions.length === 0 ? (
          <div style={{ fontSize: 12, color: "#444456", textAlign: "center", padding: "8px 0" }}>No transactions yet</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {transactions.map((tx: any) => (
              <div key={tx.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: "#111114", border: "1px solid #242428", borderRadius: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: `${CAT_COLORS[tx.category]}18`, border: `1px solid ${CAT_COLORS[tx.category]}40`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Ic n={CAT_ICONS[tx.category] || "coin"} s={12} c={CAT_COLORS[tx.category]} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>{tx.name}</div>
                  <div style={{ fontSize: 9, color: "#444456", marginTop: 1 }}>{WALLETS.find((w) => w.id === tx.wallet)?.name} · {new Date(tx.timestamp).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</div>
                </div>
                <div style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: tx.type === "income" ? "#22c55e" : "#ef4444" }}>
                  {tx.type === "income" ? "+" : ""}{tx.amount.toLocaleString()} MMK
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── GOALS SCREEN ─────────────────────────────────────────────────────────────
function GoalsScreen({ user, txData, updateUser }: any) {
  const { totalSpent, zone, projectedXP } = txData;
  const [goalAmt, setGoalAmt] = useState(user?.goalBudget || 175000);
  const [emerAmt, setEmerAmt] = useState(user?.emergencyLimit || 225000);
  const [saved,   setSaved]   = useState(false);
  const zoneColor = zone === "safe" ? "#22c55e" : zone === "warn" ? "#f59e0b" : "#ef4444";
  const challenges = [
    { text: "Spend under 5,000 today",    xp: 25,  done: true },
    { text: "No food delivery",           xp: 30,  done: true },
    { text: "Log all expenses today",     xp: 15,  done: false },
    { text: "Save 10,000 MMK this week",  xp: 50,  done: false },
  ];
  const saveGoals = async () => {
    await updateUser({ goalBudget: goalAmt, emergencyLimit: emerAmt });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
  return (
    <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
      <Card>
        <Lbl icon="target">Monthly Goal — {new Date().toLocaleString("default", { month: "long", year: "numeric" })}</Lbl>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 14 }}>
          <div style={{ background: "rgba(34,197,94,.06)", border: "1px solid rgba(34,197,94,.2)", borderRadius: 8, padding: "11px", textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "#22c55e", fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 4 }}>Goal</div>
            <div style={{ fontFamily: "monospace", fontSize: 16, fontWeight: 700, color: "#22c55e" }}>{goalAmt.toLocaleString()}</div>
            <div style={{ fontSize: 9, color: "#444456" }}>MMK</div>
          </div>
          <div style={{ background: "rgba(245,158,11,.06)", border: "1px solid rgba(245,158,11,.2)", borderRadius: 8, padding: "11px", textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "#f59e0b", fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 4 }}>Emergency</div>
            <div style={{ fontFamily: "monospace", fontSize: 16, fontWeight: 700, color: "#f59e0b" }}>{emerAmt.toLocaleString()}</div>
            <div style={{ fontSize: 9, color: "#444456" }}>MMK</div>
          </div>
          <div style={{ background: "#111114", border: "1px solid #242428", borderRadius: 8, padding: "11px", textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "#444456", fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 4 }}>Spent</div>
            <div style={{ fontFamily: "monospace", fontSize: 16, fontWeight: 700 }}>{totalSpent.toLocaleString()}</div>
            <div style={{ fontSize: 9, color: "#444456" }}>MMK</div>
          </div>
        </div>
        <div style={{ background: `${zoneColor}10`, border: `1px solid ${zoneColor}30`, borderRadius: 8, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
          <Ic n={zone === "safe" ? "shield" : "warn"} s={16} c={zoneColor} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: zoneColor }}>
              {zone === "safe" ? "Perfect Save!" : zone === "warn" ? "Safe Zone — above goal, below emergency" : "Budget Fail — over emergency limit!"}
            </div>
            <div style={{ fontSize: 10, color: "#444456", marginTop: 2 }}>
              {zone === "safe" ? "You're on track for a perfect month." : zone === "warn" ? "Keep spending under control." : "Recovery mode activated — cut spending now."}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 700, color: zoneColor }}>+{projectedXP} XP</div>
          </div>
        </div>
      </Card>

      <Card>
        <Lbl icon="edit">Adjust Goals (saved to Firebase)</Lbl>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          <div>
            <label style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: "#22c55e", marginBottom: 5, display: "block" }}>Goal Budget (MMK)</label>
            <input type="number" value={goalAmt} onChange={(e) => setGoalAmt(Number(e.target.value))}
              style={{ width: "100%", background: "#0a0a0c", border: "1px solid rgba(34,197,94,.3)", borderRadius: 7, padding: "9px 11px", fontSize: 13, fontWeight: 600, color: "#f0f0f5", fontFamily: "monospace", outline: "none", boxSizing: "border-box" as any }} />
          </div>
          <div>
            <label style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: "#f59e0b", marginBottom: 5, display: "block" }}>Emergency Limit (MMK)</label>
            <input type="number" value={emerAmt} onChange={(e) => setEmerAmt(Number(e.target.value))}
              style={{ width: "100%", background: "#0a0a0c", border: "1px solid rgba(245,158,11,.3)", borderRadius: 7, padding: "9px 11px", fontSize: 13, fontWeight: 600, color: "#f0f0f5", fontFamily: "monospace", outline: "none", boxSizing: "border-box" as any }} />
          </div>
        </div>
        <button onClick={saveGoals} style={{ background: "#22c55e", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 12, fontWeight: 700, color: "#000", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
          {saved ? <><Ic n="check" s={12} c="#000" /> Saved to Firebase!</> : "Save Goals"}
        </button>
      </Card>

      <Card>
        <Lbl icon="star">XP Reward System</Lbl>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {[
            { label: "Perfect Save — below goal",             xp: "+100 XP",  color: "#22c55e", sub: "Full rewards + rare badge chance" },
            { label: "Safe Zone — below emergency",           xp: "+40 XP",   color: "#f59e0b", sub: "Streak continues, lower reward" },
            { label: "Budget Fail — over emergency",          xp: "0 XP",     color: "#ef4444", sub: "Lose streak, -20 to -100 XP penalty" },
            { label: "Savings Bonus — per 1K saved below goal", xp: "+5 XP",  color: "#a855f7", sub: "Stacks with base reward" },
          ].map((r, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: i < 3 ? "1px solid #242428" : "none" }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 500 }}>{r.label}</div>
                <div style={{ fontSize: 10, color: "#444456", marginTop: 1 }}>{r.sub}</div>
              </div>
              <div style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: r.color, flexShrink: 0, marginLeft: 12 }}>{r.xp}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <Lbl icon="check">Daily Challenges</Lbl>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {challenges.map((ch, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: "#111114", border: "1px solid #242428", borderRadius: 7 }}>
              <div style={{ width: 15, height: 15, borderRadius: 4, border: `1.5px solid ${ch.done ? "#22c55e" : "#2e2e35"}`, background: ch.done ? "rgba(34,197,94,.15)" : "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {ch.done && <Ic n="check" s={8} c="#22c55e" />}
              </div>
              <span style={{ flex: 1, fontSize: 11, fontWeight: 500, color: ch.done ? "#444456" : "#8888a0", textDecoration: ch.done ? "line-through" : "none" }}>{ch.text}</span>
              <span style={{ fontSize: 10, fontFamily: "monospace", fontWeight: 600, color: "#f59e0b" }}>+{ch.xp} XP</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── GAME SCREEN ──────────────────────────────────────────────────────────────
function GameScreen({ user }: any) {
  const ranks = ["Bronze I","Bronze II","Silver I","Silver II","Gold I","Gold II","Gold III","Platinum I","Diamond I"];
  const cur = 6;
  const achievements = [
    { name: "7-Day Streak",  icon: "zap",    unlocked: true,  isNew: true  },
    { name: "First 100K",    icon: "dollar", unlocked: true,  isNew: false },
    { name: "Safe Zone",     icon: "shield", unlocked: true,  isNew: false },
    { name: "Speed Saver",   icon: "star",   unlocked: true,  isNew: false },
    { name: "30-Day Legend", icon: "lock",   unlocked: false, isNew: false },
    { name: "Boss Slayer",   icon: "lock",   unlocked: false, isNew: false },
    { name: "No Impulse x7", icon: "lock",   unlocked: false, isNew: false },
  ];
  return (
    <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
      <Card style={{ background: "linear-gradient(135deg, #161619, #1a1a20)", border: "1px solid rgba(168,85,247,.25)" }}>
        <Lbl icon="star">Player Stats</Lbl>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 14 }}>
          <StatBox val={String(user?.level || 1)} lbl="Level" />
          <StatBox val={String(user?.xp || 0)} lbl="Total XP" color="#f59e0b" />
          <StatBox val={String(user?.streak || 0)} lbl="Day Streak" color="#a855f7" />
          <StatBox val={String(user?.healthScore || 50)} lbl="Health" color="#22c55e" />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 11 }}>
          <span style={{ fontWeight: 600 }}>Level {user?.level || 1} — {user?.rank || "Bronze I"}</span>
          <span style={{ fontFamily: "monospace", color: "#444456" }}>{user?.xp || 0} / {((user?.level || 1) * 100)} XP</span>
        </div>
        <div style={{ height: 6, background: "#242428", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${Math.min(((user?.xp || 0) % 100), 100)}%`, background: "linear-gradient(90deg,#a855f7,#3b82f6)", borderRadius: 3 }} />
        </div>
        <div style={{ fontSize: 10, color: "#444456", marginTop: 4 }}>{(((user?.level || 1) * 100) - (user?.xp || 0))} XP to next level</div>
      </Card>

      <Card style={{ background: "rgba(239,68,68,.04)", border: "1px solid rgba(239,68,68,.2)" }}>
        <Lbl icon="game" style={{ color: "#ef4444" }}>Boss Battle</Lbl>
        <div style={{ display: "flex", gap: 14 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#ef4444", marginBottom: 6 }}>Food Monster Lv.5</div>
            <div style={{ height: 8, background: "rgba(239,68,68,.15)", borderRadius: 4, overflow: "hidden", marginBottom: 8 }}>
              <div style={{ height: "100%", width: "65%", background: "#ef4444", borderRadius: 4 }} />
            </div>
            <div style={{ fontSize: 11, color: "#8888a0" }}>Reduce food spending by 15,000 MMK to defeat this boss and earn a rare badge.</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, justifyContent: "center" }}>
            <div style={{ textAlign: "center", padding: "8px 12px", background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.25)", borderRadius: 8 }}>
              <div style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 700, color: "#ef4444" }}>-15K</div>
              <div style={{ fontSize: 9, color: "#444456" }}>MMK to win</div>
            </div>
            <div style={{ textAlign: "center", padding: "8px 12px", background: "rgba(245,158,11,.1)", border: "1px solid rgba(245,158,11,.25)", borderRadius: 8 }}>
              <div style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 700, color: "#f59e0b" }}>+150</div>
              <div style={{ fontSize: 9, color: "#444456" }}>XP reward</div>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <Lbl icon="trophy">Rank Ladder</Lbl>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {ranks.map((r, i) => (
            <div key={r} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", background: i === cur ? "rgba(168,85,247,.08)" : "transparent", border: `1px solid ${i === cur ? "rgba(168,85,247,.25)" : "transparent"}`, borderRadius: 7 }}>
              <div style={{ fontFamily: "monospace", fontSize: 10, color: "#444456", width: 20 }}>{i + 1}</div>
              <div style={{ flex: 1, fontSize: 12, fontWeight: i === cur ? 600 : 400, color: i === cur ? "#a855f7" : i < cur ? "#22c55e" : "#444456" }}>{r}</div>
              {i < cur  && <Ic n="check" s={11} c="#22c55e" />}
              {i === cur && <span style={{ fontSize: 9, fontWeight: 700, color: "#a855f7", background: "rgba(168,85,247,.15)", padding: "2px 7px", borderRadius: 10 }}>CURRENT</span>}
              {i > cur  && <Ic n="lock" s={11} c="#444456" />}
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <Lbl icon="trophy">Achievement Collection</Lbl>
        <div style={{ display: "flex", flexWrap: "wrap" as any, gap: 6, marginTop: 2 }}>
          {achievements.map((a) => (
            <div key={a.name} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 20, border: `1px solid ${a.isNew ? "rgba(34,197,94,.4)" : a.unlocked ? "rgba(245,158,11,.3)" : "#242428"}`, background: a.isNew ? "rgba(34,197,94,.1)" : a.unlocked ? "rgba(245,158,11,.08)" : "transparent", fontSize: 10, fontWeight: 600, color: a.isNew ? "#22c55e" : a.unlocked ? "#f59e0b" : "#444456" }}>
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

// ─── PROFILE SCREEN ───────────────────────────────────────────────────────────
function ProfileScreen({ user, logout, updateUser }: any) {
  const [ptab,   setPtab]   = useState("overview");
  const [notifs, setNotifs] = useState({ budget: true, xp: true, streak: false, transactions: true, email: true });
  const [twoFA,  setTwoFA]  = useState(false);
  const [animations, setAnimations] = useState(true);
  const PTABS = ["overview","history","settings","notifications","security"];

  const SRow = ({ icon, iconColor, bg, name, desc, right, onClick }: any) => (
    <div onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 15px", borderBottom: "1px solid #242428", cursor: onClick ? "pointer" : "default", transition: "background .15s" }}
      onMouseEnter={(e) => onClick && ((e.currentTarget as HTMLElement).style.background = "#111114")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: bg || "#242428", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Ic n={icon} s={14} c={iconColor || "#8888a0"} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{name}</div>
        <div style={{ fontSize: 10, color: "#444456", marginTop: 1 }}>{desc}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>{right}</div>
    </div>
  );

  const Sec = ({ title, children, danger }: any) => (
    <div style={{ background: "#161619", border: "1px solid #242428", borderRadius: 10, overflow: "hidden", marginBottom: 12 }}>
      <div style={{ padding: "9px 15px", fontSize: 10, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: danger ? "#ef4444" : "#444456", borderBottom: "1px solid #242428", background: "#111114" }}>{title}</div>
      {children}
    </div>
  );

  const initials = user?.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() || "AK";

  return (
    <div style={{ padding: "16px 20px" }}>
      {/* Hero */}
      <div style={{ background: "#161619", border: "1px solid #242428", borderRadius: 10, padding: 18, marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <div style={{ width: 60, height: 60, borderRadius: "50%", background: "linear-gradient(135deg,rgba(34,197,94,.15),rgba(34,197,94,.05))", border: "2px solid rgba(34,197,94,.3)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace", fontSize: 20, fontWeight: 700, color: "#22c55e", flexShrink: 0 }}>
            {initials}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 17, fontWeight: 700 }}>{user?.name || "Saver"}</div>
            <div style={{ fontSize: 11, color: "#22c55e", fontWeight: 600, marginTop: 2, fontFamily: "monospace" }}>Saver Rank — {user?.rank || "Bronze I"}</div>
            <div style={{ fontSize: 10, color: "#444456", marginTop: 2 }}>{user?.email}</div>
          </div>
          <button onClick={logout} style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "1px solid #2e2e35", borderRadius: 7, padding: "6px 11px", fontSize: 11, fontWeight: 600, color: "#ef4444", cursor: "pointer", fontFamily: "inherit" }}>
            <Ic n="logout" s={11} c="#ef4444" /> Logout
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 14 }}>
          <StatBox val={String(user?.level || 1)} lbl="Level" />
          <StatBox val={String(user?.streak || 0)} lbl="Streak" color="#f59e0b" />
          <StatBox val={String(user?.xp || 0)} lbl="XP" color="#a855f7" />
          <StatBox val={String(user?.healthScore || 50)} lbl="Score" color="#22c55e" />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 5 }}>
          <span style={{ fontWeight: 600 }}>Level {user?.level || 1} Progress</span>
          <span style={{ fontFamily: "monospace", color: "#444456" }}>{user?.xp || 0} / {(user?.level || 1) * 100} XP</span>
        </div>
        <div style={{ height: 6, background: "#242428", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${Math.min(((user?.xp || 0) % 100), 100)}%`, background: "#22c55e", borderRadius: 3 }} />
        </div>
      </div>

      {/* Profile Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #242428", marginBottom: 14, overflowX: "auto" as any }}>
        {PTABS.map((t) => (
          <button key={t} onClick={() => setPtab(t)} style={{ padding: "9px 14px", fontSize: 10, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", color: ptab === t ? "#f0f0f5" : "#444456", cursor: "pointer", borderBottom: `1.5px solid ${ptab === t ? "#22c55e" : "transparent"}`, background: "none", border: "none", borderBottom: `1.5px solid ${ptab === t ? "#22c55e" : "transparent"}`, fontFamily: "inherit", marginBottom: -1, transition: "color .15s", whiteSpace: "nowrap" as any }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {ptab === "overview" && (
        <>
          <Sec title="Account Details">
            <SRow icon="user" iconColor="#3b82f6" bg="rgba(59,130,246,.1)" name={user?.name || "Saver"} desc="Display name" right={<><span style={{ fontSize: 10, color: "#444456" }}>Edit</span><Ic n="chevron" s={12} c="#444456" /></>} />
            <SRow icon="mail" iconColor="#a855f7" bg="rgba(168,85,247,.1)" name={user?.email || "—"} desc="Email · Verified via Gmail" right={<Ic n="chevron" s={12} c="#444456" />} />
            <SRow icon="dollar" iconColor="#22c55e" bg="rgba(34,197,94,.1)" name="Default Currency" desc="Myanmar Kyat" right={<><span style={{ fontSize: 10, color: "#444456" }}>MMK</span><Ic n="chevron" s={12} c="#444456" /></>} />
          </Sec>
          <Sec title="Achievements">
            <div style={{ padding: "12px 15px" }}>
              <div style={{ display: "flex", flexWrap: "wrap" as any, gap: 6 }}>
                {[{ name: "7-Day Streak", isNew: true }, { name: "First 100K", isNew: false }, { name: "Safe Zone", isNew: false }].map((a) => (
                  <div key={a.name} style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 9px", borderRadius: 20, border: `1px solid ${a.isNew ? "rgba(34,197,94,.4)" : "rgba(245,158,11,.3)"}`, background: a.isNew ? "rgba(34,197,94,.1)" : "rgba(245,158,11,.08)", fontSize: 10, fontWeight: 600, color: a.isNew ? "#22c55e" : "#f59e0b" }}>
                    <Ic n="star" s={9} c={a.isNew ? "#22c55e" : "#f59e0b"} /> {a.name}
                    {a.isNew && <span style={{ fontSize: 8, background: "#22c55e", color: "#000", padding: "1px 5px", borderRadius: 10, fontWeight: 700 }}>NEW</span>}
                  </div>
                ))}
              </div>
            </div>
          </Sec>
        </>
      )}

      {ptab === "settings" && (
        <>
          <Sec title="Appearance">
            <SRow icon="sun" name="Dark Mode" desc="Always on" right={<Toggle on={true} onToggle={() => {}} />} />
            <SRow icon="health" name="Animations" desc="XP popups, reward effects" right={<Toggle on={animations} onToggle={() => setAnimations(!animations)} />} />
            <SRow icon="phone" name="Language" desc="Interface language" right={<><span style={{ fontSize: 10, color: "#444456" }}>English</span><Ic n="chevron" s={12} c="#444456" /></>} />
          </Sec>
          <Sec title="Budget & Goals">
            <SRow icon="target" iconColor="#22c55e" bg="rgba(34,197,94,.1)" name="Monthly Goal Budget" desc="Ideal monthly spending target" right={<><span style={{ fontSize: 10, fontFamily: "monospace", color: "#444456" }}>{(user?.goalBudget || 175000).toLocaleString()} MMK</span><Ic n="chevron" s={12} c="#444456" /></>} />
            <SRow icon="warn" iconColor="#f59e0b" bg="rgba(245,158,11,.1)" name="Emergency Limit" desc="Maximum spending allowed" right={<><span style={{ fontSize: 10, fontFamily: "monospace", color: "#444456" }}>{(user?.emergencyLimit || 225000).toLocaleString()} MMK</span><Ic n="chevron" s={12} c="#444456" /></>} />
          </Sec>
          <Sec title="Data">
            <SRow icon="download" name="Export Transactions" desc="Download CSV" right={<Ic n="chevron" s={12} c="#444456" />} />
          </Sec>
        </>
      )}

      {ptab === "notifications" && (
        <>
          <Sec title="Push & Email Notifications">
            <SRow icon="bell" iconColor="#22c55e" bg="rgba(34,197,94,.1)" name="Budget Warnings" desc="Alert when nearing goal — sends to Gmail" right={<Toggle on={notifs.budget} onToggle={() => setNotifs((n) => ({ ...n, budget: !n.budget }))} />} />
            <SRow icon="star" iconColor="#a855f7" bg="rgba(168,85,247,.1)" name="XP Rewards" desc="Notify when you earn XP" right={<Toggle on={notifs.xp} onToggle={() => setNotifs((n) => ({ ...n, xp: !n.xp }))} />} />
            <SRow icon="zap" iconColor="#f59e0b" bg="rgba(245,158,11,.1)" name="Streak Reminders" desc="Daily reminder to keep streak" right={<Toggle on={notifs.streak} onToggle={() => setNotifs((n) => ({ ...n, streak: !n.streak }))} />} />
            <SRow icon="wallet" name="Transaction Alerts" desc="Every new expense — sends to Gmail" right={<Toggle on={notifs.transactions} onToggle={() => setNotifs((n) => ({ ...n, transactions: !n.transactions }))} />} />
          </Sec>
          <Sec title="Channels">
            <SRow icon="mail" name="Email (Gmail)" desc={user?.email || "your gmail"} right={<Toggle on={notifs.email} onToggle={() => setNotifs((n) => ({ ...n, email: !n.email }))} />} />
            <SRow icon="send" iconColor="#3b82f6" bg="rgba(59,130,246,.1)" name="Telegram Bot" desc="Connect @MMKQuestBot" right={<><span style={{ fontSize: 10, color: "#444456" }}>Not connected</span><Ic n="chevron" s={12} c="#444456" /></>} />
          </Sec>
        </>
      )}

      {ptab === "security" && (
        <>
          <Sec title="Authentication">
            <SRow icon="lock" iconColor="#22c55e" bg="rgba(34,197,94,.1)" name="Change Password" desc="Update your password" right={<Ic n="chevron" s={12} c="#444456" />} />
            <SRow icon="shield" iconColor="#f59e0b" bg="rgba(245,158,11,.1)" name="Two-Factor Auth" desc="Extra security layer" right={<Toggle on={twoFA} onToggle={() => setTwoFA(!twoFA)} />} />
            <SRow icon="phone" name="Active Sessions" desc="Manage devices" right={<><span style={{ fontSize: 10, fontFamily: "monospace", color: "#444456" }}>2 devices</span><Ic n="chevron" s={12} c="#444456" /></>} />
          </Sec>
          <Sec title="Danger Zone" danger>
            {[
              { icon: "warn",  label: "Reset all XP and progress" },
              { icon: "trash", label: "Delete all transaction data" },
              { icon: "logout",label: "Delete account permanently" },
            ].map((d) => (
              <button key={d.label} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "12px 15px", background: "none", border: "none", borderBottom: "1px solid #242428", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 500, color: "#ef4444", textAlign: "left" as any }}>
                <Ic n={d.icon} s={13} c="#ef4444" /> {d.label}
              </button>
            ))}
          </Sec>
        </>
      )}

      {ptab === "history" && (
        <Sec title="Transaction History">
          <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "#444456", padding: "4px 0 8px" }}>From Firestore (real-time)</div>
            <div style={{ fontSize: 11, color: "#444456", textAlign: "center", padding: "8px 0" }}>
              Transactions are stored in Firestore and displayed in real-time. Add expenses to see them here.
            </div>
          </div>
        </Sec>
      )}
    </div>
  );
}

// ─── MAIN DASHBOARD PAGE ──────────────────────────────────────────────────────
const TABS = [
  { id: "home",    label: "Home",    icon: "home"   },
  { id: "wallet",  label: "Wallet",  icon: "wallet" },
  { id: "goals",   label: "Goals",   icon: "target" },
  { id: "game",    label: "Game",    icon: "game"   },
  { id: "profile", label: "Profile", icon: "user"   },
];

export default function DashboardPage() {
  const router   = useRouter();
  const { user, loading, logout, updateUserProfile } = useAuth();
  const txData   = useTransactions(user);
  const [tab,    setTab]    = useState("home");
  const [modal,  setModal]  = useState(false);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) router.replace("/auth");
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div style={{ background: "#0a0a0c", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#444456", fontSize: 12, fontFamily: "monospace" }}>Loading…</div>
      </div>
    );
  }

  const handleAdd = async (name: string, amount: number, cat: string, wallet: string) => {
    await txData.addCashTransaction(name, amount, cat, wallet);
  };

  const xpPct = Math.min(((user.xp || 0) % 100), 100);

  return (
    <div style={{ background: "#0a0a0c", fontFamily: "'Syne', sans-serif", color: "#f0f0f5", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.2}}
        *{box-sizing:border-box}
        input::placeholder{color:#444456}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#0a0a0c}::-webkit-scrollbar-thumb{background:#2e2e35;border-radius:2px}
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 20px", background: "#111114", borderBottom: "1px solid #242428", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 15, fontWeight: 700, letterSpacing: ".05em" }}>
          MMK<span style={{ color: "#22c55e" }}>Quest</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <div style={{ fontSize: 9, color: "#444456", fontFamily: "monospace" }}>XP {user.xp}/{(user.level || 1) * 100}</div>
            <div style={{ width: 90, height: 3, background: "#242428", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${xpPct}%`, background: "#22c55e", borderRadius: 2 }} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(168,85,247,.1)", border: "1px solid rgba(168,85,247,.25)", borderRadius: 20, padding: "5px 11px", fontSize: 11, fontWeight: 500, color: "#a855f7" }}>
            <Ic n="star" s={10} c="#a855f7" /> Lv {user.level || 1}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(245,158,11,.1)", border: "1px solid rgba(245,158,11,.25)", borderRadius: 20, padding: "5px 11px", fontSize: 11, fontWeight: 500, color: "#f59e0b" }}>
            <Ic n="zap" s={10} c="#f59e0b" /> {user.streak || 0}d
          </div>
          <button onClick={() => setModal(true)} style={{ display: "flex", alignItems: "center", gap: 6, background: "#22c55e", color: "#000", border: "none", borderRadius: 8, padding: "7px 13px", fontSize: 11, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit" }}>
            <Ic n="plus" s={12} c="#000" /> Add Spend
          </button>
        </div>
      </div>

      {/* Nav */}
      <div style={{ display: "flex", background: "#111114", borderBottom: "1px solid #242428", padding: "0 20px", position: "sticky", top: 53, zIndex: 49 }}>
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "11px 13px", fontSize: 10, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: tab === t.id ? "#f0f0f5" : "#444456", cursor: "pointer", borderBottom: `1.5px solid ${tab === t.id ? "#22c55e" : "transparent"}`, background: "none", border: "none", borderBottom: `1.5px solid ${tab === t.id ? "#22c55e" : "transparent"}`, fontFamily: "inherit", marginBottom: -1, transition: "color .15s", whiteSpace: "nowrap" }}>
            <Ic n={t.icon} s={11} color={tab === t.id ? "#f0f0f5" : "#444456"} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ maxHeight: "calc(100vh - 96px)", overflowY: "auto" }}>
        {tab === "home"    && <HomeScreen user={user} txData={txData} />}
        {tab === "wallet"  && <WalletScreen txData={txData} />}
        {tab === "goals"   && <GoalsScreen user={user} txData={txData} updateUser={updateUserProfile} />}
        {tab === "game"    && <GameScreen user={user} />}
        {tab === "profile" && <ProfileScreen user={user} logout={logout} updateUser={updateUserProfile} />}
      </div>

      {/* Add Spend Modal */}
      <AddSpendModal open={modal} onClose={() => setModal(false)} onAdd={handleAdd} />
    </div>
  );
}
