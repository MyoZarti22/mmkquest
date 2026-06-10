// app/dashboard/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useTransactions, WALLETS, CAT_COLORS, CAT_ICONS } from "@/hooks/useTransactions";


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
    refresh:  <><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></>,
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
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
    chevron:  <polyline points="9 18 15 12 9 6"/>,
  };
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c}
      strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      {p[n] ?? null}
    </svg>
  );
}

// ─── SHARED UI ────────────────────────────────────────────────────────────────
const CARD: React.CSSProperties = { background: "#161619", border: "1px solid #242428", borderRadius: 10, padding: "13px 15px" };
function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ ...CARD, ...style }}>{children}</div>;
}
function Lbl({ icon, children }: { icon?: string; children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color: "#444456", marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
      {icon && <Ic n={icon} s={10} c="#444456" />}{children}
    </div>
  );
}
function Sec({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#161619", border: "1px solid #242428", borderRadius: 10, overflow: "hidden", marginBottom: 12 }}>
      <div style={{ padding: "9px 15px", fontSize: 10, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "#444456", borderBottom: "1px solid #242428", background: "#111114" }}>{title}</div>
      {children}
    </div>
  );
}
function Row({ icon, iconColor, iconBg, name, desc, right }: any) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 15px", borderBottom: "1px solid #242428", cursor: "pointer" }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: iconBg || "#242428", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Ic n={icon} s={14} c={iconColor || "#8888a0"} />
      </div>
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

// ─── ADD SPEND MODAL ──────────────────────────────────────────────────────────
const CATS = [
  { id: "food",      icon: "food"    },
  { id: "gaming",    icon: "gaming"  },
  { id: "transport", icon: "bus"     },
  { id: "shopping",  icon: "shop"    },
  { id: "bills",     icon: "bill"    },
  { id: "other",     icon: "coin"    },
];

function AddSpendModal({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: (n: string, a: number, c: string, w: string) => Promise<void> }) {
  const [amt,     setAmt]    = useState("");
  const [desc,    setDesc]   = useState("");
  const [cat,     setCat]    = useState("food");
  const [wallet,  setWallet] = useState("cash");
  const [busy,    setBusy]   = useState(false);
  const [ok,      setOk]     = useState(false);
  const [errs,    setErrs]   = useState<Record<string, boolean>>({});

  const submit = async () => {
    const e: Record<string, boolean> = {};
    if (!amt)  e.amt  = true;
    if (!desc) e.desc = true;
    if (Object.keys(e).length) { setErrs(e); return; }
    setErrs({}); setBusy(true);
    try {
      await onAdd(desc, Number(amt), cat, wallet);
      setOk(true);
      setTimeout(() => { setOk(false); setAmt(""); setDesc(""); setCat("food"); setWallet("cash"); onClose(); }, 1500);
    } catch { setBusy(false); }
  };

  if (!open) return null;
  const inp = (err?: boolean) => ({ width: "100%", background: "#0a0a0c", border: `1px solid ${err ? "#ef4444" : "#2e2e35"}`, borderRadius: 7, padding: "9px 11px", fontSize: 13, fontWeight: 500, color: "#f0f0f5", fontFamily: "inherit", outline: "none", boxSizing: "border-box" as const });

  return (
    <div onClick={(e) => e.target === e.currentTarget && onClose()} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.8)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#161619", border: "1px solid #2e2e35", borderRadius: 14, padding: 24, width: 360, maxWidth: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ fontSize: 15, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}><Ic n="plus" s={15} c="#22c55e" /> Add Cash Expense</div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex" }}><Ic n="x" s={16} c="#444456" /></button>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "#444456", marginBottom: 5, display: "block" }}>Amount (MMK)</label>
          <input style={{ ...inp(errs.amt), fontFamily: "monospace", fontSize: 18, fontWeight: 700 }} type="number" placeholder="e.g. 3,500" value={amt} onChange={(e) => { setAmt(e.target.value); setErrs((v) => ({ ...v, amt: false })); }} />
          {errs.amt && <div style={{ fontSize: 10, color: "#ef4444", marginTop: 3 }}>Amount required</div>}
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "#444456", marginBottom: 5, display: "block" }}>Description</label>
          <input style={inp(errs.desc)} type="text" placeholder="e.g. Shan noodles" value={desc} onChange={(e) => { setDesc(e.target.value); setErrs((v) => ({ ...v, desc: false })); }} onKeyDown={(e) => e.key === "Enter" && submit()} />
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
          <label style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "#444456", marginBottom: 5, display: "block" }}>Wallet</label>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {WALLETS.map((w) => (
              <div key={w.id} onClick={() => setWallet(w.id)} style={{ padding: "5px 10px", background: wallet === w.id ? "rgba(34,197,94,.1)" : "#111114", border: `1px solid ${wallet === w.id ? "rgba(34,197,94,.35)" : "#2e2e35"}`, borderRadius: 20, fontSize: 10, fontWeight: 600, color: wallet === w.id ? "#22c55e" : "#8888a0", cursor: "pointer" }}>
                {w.short}
              </div>
            ))}
          </div>
        </div>
        <button onClick={submit} disabled={busy} style={{ width: "100%", background: "#22c55e", border: "none", borderRadius: 8, padding: 11, fontSize: 13, fontWeight: 700, color: "#000", cursor: busy ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, opacity: busy ? .7 : 1 }}>
          {busy ? <span style={{ width: 14, height: 14, border: "2px solid #000", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block", animation: "spin 1s linear infinite" }} /> : "Log Expense"}
        </button>
        {ok && <div style={{ textAlign: "center", marginTop: 10, fontSize: 12, fontWeight: 600, color: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}><Ic n="check" s={12} c="#22c55e" /> Logged — +15 XP!</div>}
      </div>
    </div>
  );
}

// ─── HOME SCREEN ──────────────────────────────────────────────────────────────
function HomeScreen({ user, txData }: any) {
  const { transactions, totalSpent, totalIncome, totalBalance, categoryTotals, budgetPct, zone, projectedXP } = txData;
  const goal = user?.goalBudget || 175000;
  const emergency = user?.emergencyLimit || 225000;
  const zoneColor = zone === "safe" ? "#22c55e" : zone === "warn" ? "#f59e0b" : "#ef4444";
  const maxCat = Math.max(...Object.values(categoryTotals as Record<string, number>), 1) as number;
  const G: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 11, padding: "16px 20px" };

  return (
    <div>
      <div style={G}>
        <Card>
          <Lbl icon="dollar">Balance</Lbl>
          <div style={{ fontFamily: "monospace", fontSize: 20, fontWeight: 700, color: "#22c55e" }}>{totalBalance.toLocaleString()}</div>
          <div style={{ fontSize: 10, color: "#444456", marginTop: 3, fontFamily: "monospace" }}>MMK total</div>
          <div style={{ fontSize: 10, fontWeight: 600, color: "#22c55e", marginTop: 5 }}>All 5 wallets</div>
        </Card>
        <Card>
          <Lbl icon="trending">Income</Lbl>
          <div style={{ fontFamily: "monospace", fontSize: 20, fontWeight: 700, color: "#3b82f6" }}>{totalIncome.toLocaleString()}</div>
          <div style={{ fontSize: 10, color: "#444456", marginTop: 3, fontFamily: "monospace" }}>MMK this month</div>
        </Card>
        <Card>
          <Lbl icon="wallet">Spent</Lbl>
          <div style={{ fontFamily: "monospace", fontSize: 20, fontWeight: 700, color: "#f59e0b" }}>{totalSpent.toLocaleString()}</div>
          <div style={{ fontSize: 10, color: "#444456", marginTop: 3, fontFamily: "monospace" }}>of {goal.toLocaleString()} goal</div>
        </Card>

        {/* Budget Meter */}
        <Card style={{ gridColumn: "1/-1" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 0 }}>
            <Lbl icon="bar" style={{ margin: 0 }}>Budget Meter<LiveDot /></Lbl>
            <span style={{ fontSize: 10, fontFamily: "monospace", color: "#444456" }}>+{projectedXP} XP at month end</span>
          </div>
          <div style={{ height: 7, background: "#242428", borderRadius: 4, marginTop: 10, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${budgetPct}%`, background: zoneColor, borderRadius: 4, transition: "width .5s" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5, fontSize: 9, fontFamily: "monospace" }}>
            <span style={{ color: "#444456" }}>0</span>
            <span style={{ color: "#22c55e" }}>Goal {(goal / 1000).toFixed(0)}K</span>
            <span style={{ color: "#f59e0b" }}>Emergency {(emergency / 1000).toFixed(0)}K</span>
          </div>
          <div style={{ marginTop: 7, fontSize: 11, fontWeight: 600, color: zoneColor }}>
            {zone === "safe" ? "Perfect Save Zone — below goal" : zone === "warn" ? "Safe Zone — above goal, below emergency" : "DANGER — Over Emergency Limit!"}
          </div>
        </Card>

        {/* Categories */}
        <Card style={{ gridColumn: "span 2" }}>
          <Lbl icon="bar">Spending by Category</Lbl>
          <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 4 }}>
            {Object.entries(categoryTotals as Record<string, number>).slice(0, 4).map(([cat, val]) => (
              <div key={cat} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <div style={{ width: 26, height: 26, borderRadius: 6, background: `${CAT_COLORS[cat]}18`, border: `1px solid ${CAT_COLORS[cat]}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Ic n={CAT_ICONS[cat] || "coin"} s={12} c={CAT_COLORS[cat]} />
                </div>
                <div style={{ fontSize: 11, color: "#8888a0", width: 62, flexShrink: 0, textTransform: "capitalize" }}>{cat}</div>
                <div style={{ flex: 1, height: 4, background: "#242428", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${((val as number) / maxCat) * 100}%`, background: CAT_COLORS[cat], borderRadius: 2 }} />
                </div>
                <div style={{ fontSize: 10, fontFamily: "monospace", color: "#444456", width: 36, textAlign: "right" }}>{((val as number) / Math.max(totalSpent, 1) * 100).toFixed(0)}%</div>
              </div>
            ))}
            {Object.keys(categoryTotals).length === 0 && (
              <div style={{ fontSize: 11, color: "#444456", textAlign: "center", padding: "12px 0" }}>No expenses yet — add your first spend!</div>
            )}
          </div>
        </Card>

        {/* Savings Ring */}
        <Card>
          <Lbl icon="target">Savings</Lbl>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, marginTop: 4 }}>
            <svg width="76" height="76" viewBox="0 0 76 76">
              <circle cx="38" cy="38" r="30" fill="none" stroke="#242428" strokeWidth="7" />
              <circle cx="38" cy="38" r="30" fill="none" stroke="#22c55e" strokeWidth="7" strokeLinecap="round"
                strokeDasharray="188"
                strokeDashoffset={188 - (188 * Math.min((totalBalance / 500000) * 100, 100)) / 100}
                transform="rotate(-90 38 38)" />
              <text x="38" y="38" textAnchor="middle" dy="5" fontFamily="monospace" fontSize="12" fontWeight="700" fill="#22c55e">
                {Math.round((totalBalance / 500000) * 100)}%
              </text>
            </svg>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 600, color: "#22c55e" }}>{totalBalance.toLocaleString()} MMK</div>
              <div style={{ fontSize: 10, color: "#444456", marginTop: 2 }}>total saved</div>
            </div>
          </div>
        </Card>

        {/* Recent Transactions */}
        <Card style={{ gridColumn: "1/-1" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <Lbl icon="wallet" style={{ margin: 0 }}>Recent Transactions<LiveDot /></Lbl>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {transactions.slice(0, 6).map((tx: any) => (
              <div key={tx.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: "#111114", border: "1px solid #242428", borderRadius: 8 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: `${CAT_COLORS[tx.category] || "#8888a0"}18`, border: `1px solid ${CAT_COLORS[tx.category] || "#8888a0"}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Ic n={CAT_ICONS[tx.category] || "coin"} s={13} c={CAT_COLORS[tx.category] || "#8888a0"} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>{tx.name}</div>
                  <div style={{ fontSize: 10, color: "#444456", marginTop: 1, textTransform: "capitalize" }}>{tx.category} · {WALLETS.find((w) => w.id === tx.wallet)?.name || tx.wallet}</div>
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
            {transactions.length === 0 && (
              <div style={{ fontSize: 11, color: "#444456", textAlign: "center", padding: "16px 0" }}>No transactions yet. Tap Add Spend to get started!</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── WALLET SCREEN ────────────────────────────────────────────────────────────
function WalletScreen({ txData }: any) {
  const { totalBalance } = txData;
  return (
    <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 11 }}>
      <Card>
        <Lbl icon="wallet">Myanmar Wallets & Banks</Lbl>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {WALLETS.map((w) => (
            <div key={w.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 13px", background: "#111114", border: `1px solid ${w.status === "connected" ? `${w.color}30` : "#242428"}`, borderRadius: 9, cursor: "pointer" }}>
              <div style={{ width: 34, height: 34, background: `${w.color}18`, border: `1px solid ${w.color}40`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Ic n="wallet" s={15} c={w.color} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{w.name}</div>
                <div style={{ fontSize: 10, color: w.status === "connected" ? "#444456" : "#f59e0b", marginTop: 1 }}>
                  {w.id === "cash" ? "Manual entry only" : w.status === "connected" ? "Connected · Auto-sync" : "Manual mode"}
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
      <Card style={{ background: "rgba(34,197,94,.06)", border: "1px solid rgba(34,197,94,.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "#22c55e", marginBottom: 4 }}>Total Across All Wallets</div>
            <div style={{ fontFamily: "monospace", fontSize: 26, fontWeight: 700, color: "#22c55e" }}>{totalBalance.toLocaleString()} <span style={{ fontSize: 14 }}>MMK</span></div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, color: "#444456" }}>5 connected wallets</div>
            <div style={{ fontSize: 10, color: "#22c55e", marginTop: 3 }}>Auto-syncing</div>
          </div>
        </div>
      </Card>
      <Card>
        <Lbl icon="health">Integration Phases</Lbl>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            { phase: "Phase 1", label: "Manual Entry",  status: "ACTIVE",   color: "#22c55e" },
            { phase: "Phase 2", label: "Email Parsing", status: "ACTIVE",   color: "#22c55e" },
            { phase: "Phase 3", label: "SMS Parsing",   status: "BETA",     color: "#f59e0b" },
            { phase: "Phase 4", label: "Official APIs", status: "PLANNED",  color: "#444456" },
          ].map((p) => (
            <div key={p.phase} style={{ background: "#111114", border: `1px solid ${p.color}30`, borderRadius: 8, padding: "9px 11px" }}>
              <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: p.color, marginBottom: 3 }}>{p.phase}</div>
              <div style={{ fontSize: 12, fontWeight: 500 }}>{p.label}</div>
              <div style={{ fontSize: 9, fontWeight: 600, color: p.color, marginTop: 3 }}>{p.status}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── GOALS SCREEN ─────────────────────────────────────────────────────────────
function GoalsScreen({ user, txData, updateUser }: any) {
  const { totalSpent, zone, projectedXP } = txData;
  const [goalAmt, setGoalAmt] = useState(user?.goalBudget     || 175000);
  const [emerAmt, setEmerAmt] = useState(user?.emergencyLimit || 225000);
  const [saved,   setSaved]   = useState(false);
  const zoneColor = zone === "safe" ? "#22c55e" : zone === "warn" ? "#f59e0b" : "#ef4444";

  const saveGoals = async () => {
    await updateUser({ goalBudget: goalAmt, emergencyLimit: emerAmt });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const challenges = [
    { text: "Spend under 5,000 today",   xp: 25, done: true  },
    { text: "No food delivery",          xp: 30, done: true  },
    { text: "Log all expenses today",    xp: 15, done: false },
    { text: "Save 10,000 MMK this week", xp: 50, done: false },
  ];

  return (
    <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
      <Card>
        <Lbl icon="target">Monthly Goal — {new Date().toLocaleString("default", { month: "long", year: "numeric" })}</Lbl>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 14 }}>
          <div style={{ background: "rgba(34,197,94,.06)", border: "1px solid rgba(34,197,94,.2)", borderRadius: 8, padding: 11, textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "#22c55e", fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 4 }}>Goal</div>
            <div style={{ fontFamily: "monospace", fontSize: 16, fontWeight: 700, color: "#22c55e" }}>{goalAmt.toLocaleString()}</div>
            <div style={{ fontSize: 9, color: "#444456" }}>MMK</div>
          </div>
          <div style={{ background: "rgba(245,158,11,.06)", border: "1px solid rgba(245,158,11,.2)", borderRadius: 8, padding: 11, textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "#f59e0b", fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 4 }}>Emergency</div>
            <div style={{ fontFamily: "monospace", fontSize: 16, fontWeight: 700, color: "#f59e0b" }}>{emerAmt.toLocaleString()}</div>
            <div style={{ fontSize: 9, color: "#444456" }}>MMK</div>
          </div>
          <div style={{ background: "#111114", border: "1px solid #242428", borderRadius: 8, padding: 11, textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "#444456", fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 4 }}>Spent</div>
            <div style={{ fontFamily: "monospace", fontSize: 16, fontWeight: 700 }}>{totalSpent.toLocaleString()}</div>
            <div style={{ fontSize: 9, color: "#444456" }}>MMK</div>
          </div>
        </div>
        <div style={{ background: `${zoneColor}10`, border: `1px solid ${zoneColor}35`, borderRadius: 8, padding: "11px 14px", display: "flex", alignItems: "center", gap: 10 }}>
          <Ic n={zone === "safe" ? "shield" : "warn"} s={16} c={zoneColor} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: zoneColor }}>
              {zone === "safe" ? "Perfect Save" : zone === "warn" ? "Safe Zone" : "Budget Exceeded"}
            </div>
            <div style={{ fontSize: 10, color: "#444456", marginTop: 2 }}>
              {zone === "safe" ? "Below goal — you earn maximum XP!" : zone === "warn" ? "Above goal but below emergency limit" : "Over emergency limit — recovery mode"}
            </div>
          </div>
          <div style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 700, color: zoneColor }}>+{projectedXP} XP</div>
        </div>
      </Card>

      <Card>
        <Lbl icon="edit">Adjust Monthly Goals</Lbl>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: "#22c55e", marginBottom: 5, display: "block" }}>Goal Budget (MMK)</label>
            <input type="number" value={goalAmt} onChange={(e) => setGoalAmt(Number(e.target.value))} style={{ width: "100%", background: "#0a0a0c", border: "1px solid rgba(34,197,94,.3)", borderRadius: 7, padding: "9px 11px", fontSize: 13, fontWeight: 600, color: "#f0f0f5", fontFamily: "monospace", outline: "none", boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: "#f59e0b", marginBottom: 5, display: "block" }}>Emergency Limit (MMK)</label>
            <input type="number" value={emerAmt} onChange={(e) => setEmerAmt(Number(e.target.value))} style={{ width: "100%", background: "#0a0a0c", border: "1px solid rgba(245,158,11,.3)", borderRadius: 7, padding: "9px 11px", fontSize: 13, fontWeight: 600, color: "#f0f0f5", fontFamily: "monospace", outline: "none", boxSizing: "border-box" }} />
          </div>
        </div>
        <button onClick={saveGoals} style={{ marginTop: 10, width: "100%", background: saved ? "#111114" : "#22c55e", border: saved ? "1px solid rgba(34,197,94,.3)" : "none", borderRadius: 8, padding: "10px", fontSize: 12, fontWeight: 700, color: saved ? "#22c55e" : "#000", cursor: "pointer", fontFamily: "inherit" }}>
          {saved ? "Saved!" : "Save Goals"}
        </button>
      </Card>

      <Card>
        <Lbl icon="star">XP Reward System</Lbl>
        {[
          { label: "Perfect Save — Below goal",          xp: "+100 XP",  color: "#22c55e", sub: "Full rewards + rare badge chance" },
          { label: "Safe Zone — Below emergency limit",  xp: "+40 XP",   color: "#f59e0b", sub: "Streak continues, lower reward" },
          { label: "Budget Fail — Over emergency",       xp: "0 XP",     color: "#ef4444", sub: "Lose streak, XP penalty applied" },
          { label: "Bonus — per 1,000 MMK below goal",  xp: "+5 XP",    color: "#a855f7", sub: "Stacks with base reward" },
        ].map((r, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: i < 3 ? "1px solid #242428" : "none" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 500 }}>{r.label}</div>
              <div style={{ fontSize: 10, color: "#444456", marginTop: 1 }}>{r.sub}</div>
            </div>
            <div style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: r.color, flexShrink: 0, marginLeft: 12 }}>{r.xp}</div>
          </div>
        ))}
      </Card>

      <Card>
        <Lbl icon="check">Daily Challenges</Lbl>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {challenges.map((ch, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: "#111114", border: "1px solid #242428", borderRadius: 7 }}>
              <div style={{ width: 15, height: 15, borderRadius: 4, border: `1.5px solid ${ch.done ? "#22c55e" : "#2e2e35"}`, background: ch.done ? "rgba(34,197,94,.15)" : "none", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
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
  const currentRank = 6;
  const achievements = [
    { name: "7-Day Streak", icon: "zap",    unlocked: true,  isNew: true  },
    { name: "First 100K",   icon: "dollar", unlocked: true,  isNew: false },
    { name: "Safe Zone",    icon: "shield", unlocked: true,  isNew: false },
    { name: "Speed Saver",  icon: "star",   unlocked: true,  isNew: false },
    { name: "30-Day Legend",icon: "lock",   unlocked: false, isNew: false },
    { name: "Boss Slayer",  icon: "lock",   unlocked: false, isNew: false },
  ];
  return (
    <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
      <Card style={{ background: "linear-gradient(135deg, #161619 0%, #1a1a20 100%)", border: "1px solid rgba(168,85,247,.25)" }}>
        <Lbl icon="star">Player Stats</Lbl>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 14 }}>
          {[
            { val: String(user?.level || 1), lbl: "Level",      color: "#f0f0f5" },
            { val: String(user?.xp    || 0), lbl: "Total XP",   color: "#f59e0b" },
            { val: String(user?.streak|| 0), lbl: "Day Streak", color: "#a855f7" },
            { val: "82",                     lbl: "Score",       color: "#22c55e" },
          ].map((s) => (
            <div key={s.lbl} style={{ background: "#111114", border: "1px solid #242428", borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
              <div style={{ fontFamily: "monospace", fontSize: 17, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "#444456", marginTop: 3 }}>{s.lbl}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 5 }}>
          <span style={{ fontWeight: 600 }}>Level {user?.level || 1} Progress</span>
          <span style={{ fontFamily: "monospace", color: "#444456" }}>{user?.xp || 0} / {(user?.level || 1) * 100} XP</span>
        </div>
        <div style={{ height: 6, background: "#242428", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${Math.min(((user?.xp || 0) % 100), 100)}%`, background: "linear-gradient(90deg, #a855f7, #3b82f6)", borderRadius: 3 }} />
        </div>
        <div style={{ fontSize: 10, color: "#444456", marginTop: 4 }}>
          {100 - ((user?.xp || 0) % 100)} XP to next level
        </div>
      </Card>

      <Card style={{ background: "rgba(239,68,68,.05)", border: "1px solid rgba(239,68,68,.2)" }}>
        <Lbl icon="game">Boss Battle</Lbl>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#ef4444", marginBottom: 6 }}>Food Monster Lv.5</div>
        <div style={{ height: 8, background: "rgba(239,68,68,.15)", borderRadius: 4, overflow: "hidden", marginBottom: 6 }}>
          <div style={{ height: "100%", width: "65%", background: "#ef4444", borderRadius: 4 }} />
        </div>
        <div style={{ fontSize: 11, color: "#8888a0" }}>Reduce food spending by 15,000 MMK to defeat this boss and earn a rare badge.</div>
      </Card>

      <Card>
        <Lbl icon="trophy">Rank Ladder</Lbl>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {ranks.map((r, i) => (
            <div key={r} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", background: i === currentRank ? "rgba(168,85,247,.08)" : "transparent", border: `1px solid ${i === currentRank ? "rgba(168,85,247,.25)" : "transparent"}`, borderRadius: 7 }}>
              <div style={{ fontFamily: "monospace", fontSize: 10, color: "#444456", width: 20 }}>{i + 1}</div>
              <div style={{ flex: 1, fontSize: 12, fontWeight: i === currentRank ? 600 : 400, color: i === currentRank ? "#a855f7" : i < currentRank ? "#22c55e" : "#444456" }}>{r}</div>
              {i < currentRank  && <Ic n="check" s={11} c="#22c55e" />}
              {i === currentRank && <span style={{ fontSize: 9, fontWeight: 700, color: "#a855f7", background: "rgba(168,85,247,.15)", padding: "2px 7px", borderRadius: 10 }}>CURRENT</span>}
              {i > currentRank  && <Ic n="lock" s={11} c="#444456" />}
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <Lbl icon="trophy">Achievements</Lbl>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 2 }}>
          {achievements.map((a) => (
            <div key={a.name} style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 20, border: `1px solid ${a.isNew ? "rgba(34,197,94,.4)" : a.unlocked ? "rgba(245,158,11,.3)" : "#242428"}`, background: a.isNew ? "rgba(34,197,94,.1)" : a.unlocked ? "rgba(245,158,11,.08)" : "transparent", fontSize: 10, fontWeight: 600, color: a.isNew ? "#22c55e" : a.unlocked ? "#f59e0b" : "#444456" }}>
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

// ─── ANALYTICS SCREEN (NEW) ───────────────────────────────────────────────────
function AnalyticsScreen({ txData }: any) {
  const { transactions } = txData;
  const [view, setView] = useState<"monthly" | "yearly">("monthly");

  // Group transactions by month
  const grouped: Record<string, { income: number; expense: number }> = {};
  transactions.forEach((tx: any) => {
    const d   = new Date(tx.timestamp);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!grouped[key]) grouped[key] = { income: 0, expense: 0 };
    if (tx.type === "income")  grouped[key].income  += tx.amount;
    if (tx.type === "expense") grouped[key].expense += Math.abs(tx.amount);
  });

  // Group by year
  const yearly: Record<string, { income: number; expense: number }> = {};
  transactions.forEach((tx: any) => {
    const y = String(new Date(tx.timestamp).getFullYear());
    if (!yearly[y]) yearly[y] = { income: 0, expense: 0 };
    if (tx.type === "income")  yearly[y].income  += tx.amount;
    if (tx.type === "expense") yearly[y].expense += Math.abs(tx.amount);
  });

  const monthData = Object.entries(grouped).sort().slice(-6);
  const yearData  = Object.entries(yearly).sort();

  const data = view === "monthly" ? monthData : yearData;
  const maxVal = Math.max(...data.map(([, v]) => Math.max(v.income, v.expense)), 1);

  // Month-over-month diff
  const months = Object.entries(grouped).sort();
  const lastMonth  = months[months.length - 1];
  const prevMonth  = months[months.length - 2];
  const expDiff    = lastMonth && prevMonth ? lastMonth[1].expense - prevMonth[1].expense : 0;
  const incDiff    = lastMonth && prevMonth ? lastMonth[1].income  - prevMonth[1].income  : 0;

  const fmtKey = (k: string) => {
    if (view === "yearly") return k;
    const [y, m] = k.split("-");
    return new Date(Number(y), Number(m) - 1).toLocaleString("default", { month: "short", year: "2-digit" });
  };

  return (
    <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>

      {/* View toggle */}
      <div style={{ display: "flex", gap: 6 }}>
        {(["monthly", "yearly"] as const).map((v) => (
          <button key={v} onClick={() => setView(v)} style={{ padding: "7px 16px", borderRadius: 20, border: `1px solid ${view === v ? "rgba(34,197,94,.35)" : "#2e2e35"}`, background: view === v ? "rgba(34,197,94,.1)" : "#111114", fontSize: 11, fontWeight: 600, color: view === v ? "#22c55e" : "#8888a0", cursor: "pointer", fontFamily: "inherit", textTransform: "capitalize" }}>
            {v}
          </button>
        ))}
      </div>

      {/* Month-over-month diff cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Card>
          <Lbl icon="trending">Spending Change</Lbl>
          <div style={{ fontFamily: "monospace", fontSize: 20, fontWeight: 700, color: expDiff > 0 ? "#ef4444" : "#22c55e" }}>
            {expDiff >= 0 ? "+" : ""}{expDiff.toLocaleString()}
          </div>
          <div style={{ fontSize: 10, color: "#444456", marginTop: 3 }}>MMK vs last month</div>
          <div style={{ fontSize: 10, fontWeight: 600, marginTop: 4, color: expDiff > 0 ? "#ef4444" : "#22c55e" }}>
            {expDiff > 0 ? "Spent more" : expDiff < 0 ? "Spent less" : "Same as last month"}
          </div>
        </Card>
        <Card>
          <Lbl icon="dollar">Income Change</Lbl>
          <div style={{ fontFamily: "monospace", fontSize: 20, fontWeight: 700, color: incDiff >= 0 ? "#22c55e" : "#ef4444" }}>
            {incDiff >= 0 ? "+" : ""}{incDiff.toLocaleString()}
          </div>
          <div style={{ fontSize: 10, color: "#444456", marginTop: 3 }}>MMK vs last month</div>
          <div style={{ fontSize: 10, fontWeight: 600, marginTop: 4, color: incDiff >= 0 ? "#22c55e" : "#ef4444" }}>
            {incDiff > 0 ? "Earned more" : incDiff < 0 ? "Earned less" : "Same as last month"}
          </div>
        </Card>
      </div>

      {/* Bar chart */}
      <Card>
        <Lbl icon="analytics">{view === "monthly" ? "Last 6 Months" : "Yearly Overview"}</Lbl>
        {data.length === 0 ? (
          <div style={{ textAlign: "center", padding: "20px 0", fontSize: 11, color: "#444456" }}>No data yet — add transactions to see analytics</div>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 100, marginTop: 10, marginBottom: 4 }}>
              {data.map(([key, val]) => (
                <div key={key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, height: "100%", justifyContent: "flex-end" }}>
                  <div style={{ width: "100%", display: "flex", gap: 2, alignItems: "flex-end", justifyContent: "center" }}>
                    <div style={{ flex: 1, background: "#22c55e", borderRadius: "2px 2px 0 0", height: `${(val.income / maxVal) * 90}%`, minHeight: 3, opacity: 0.8 }} title={`Income: ${val.income.toLocaleString()}`} />
                    <div style={{ flex: 1, background: "#ef4444", borderRadius: "2px 2px 0 0", height: `${(val.expense / maxVal) * 90}%`, minHeight: 3, opacity: 0.8 }} title={`Expense: ${val.expense.toLocaleString()}`} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {data.map(([key]) => (
                <div key={key} style={{ flex: 1, textAlign: "center", fontSize: 9, color: "#444456", fontFamily: "monospace" }}>{fmtKey(key)}</div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 14, marginTop: 10, justifyContent: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#8888a0" }}><div style={{ width: 10, height: 10, background: "#22c55e", borderRadius: 2 }} /> Income</div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#8888a0" }}><div style={{ width: 10, height: 10, background: "#ef4444", borderRadius: 2 }} /> Expense</div>
            </div>
          </>
        )}
      </Card>

      {/* Monthly table */}
      <Card>
        <Lbl icon="calendar">Month-by-Month History</Lbl>
        {months.length === 0 ? (
          <div style={{ textAlign: "center", padding: "12px 0", fontSize: 11, color: "#444456" }}>No data yet</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, padding: "7px 0", borderBottom: "1px solid #242428", fontSize: 9, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: "#444456" }}>
              <span>Month</span><span style={{ textAlign: "right" }}>Income</span><span style={{ textAlign: "right" }}>Expense</span><span style={{ textAlign: "right" }}>Net</span>
            </div>
            {[...months].reverse().map(([key, val], i) => {
              const net     = val.income - val.expense;
              const prevKey = [...months].reverse()[i + 1];
              const expChg  = prevKey ? val.expense - prevKey[1].expense : 0;
              const [y, m]  = key.split("-");
              const label   = new Date(Number(y), Number(m) - 1).toLocaleString("default", { month: "short", year: "numeric" });
              return (
                <div key={key} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, padding: "9px 0", borderBottom: "1px solid #242428", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500 }}>{label}</div>
                    {expChg !== 0 && (
                      <div style={{ fontSize: 9, color: expChg > 0 ? "#ef4444" : "#22c55e", marginTop: 1 }}>
                        {expChg > 0 ? "+" : ""}{expChg.toLocaleString()} spending
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: "right", fontFamily: "monospace", fontSize: 11, fontWeight: 600, color: "#22c55e" }}>{val.income.toLocaleString()}</div>
                  <div style={{ textAlign: "right", fontFamily: "monospace", fontSize: 11, fontWeight: 600, color: "#ef4444" }}>{val.expense.toLocaleString()}</div>
                  <div style={{ textAlign: "right", fontFamily: "monospace", fontSize: 11, fontWeight: 700, color: net >= 0 ? "#22c55e" : "#ef4444" }}>
                    {net >= 0 ? "+" : ""}{net.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* All transactions history */}
      <Card>
        <Lbl icon="wallet">Full Transaction History</Lbl>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 4 }}>
          {transactions.length === 0 && (
            <div style={{ textAlign: "center", padding: "12px 0", fontSize: 11, color: "#444456" }}>No transactions yet</div>
          )}
          {transactions.map((tx: any) => (
            <div key={tx.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: "#111114", border: "1px solid #242428", borderRadius: 8 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: CAT_COLORS[tx.category] || "#8888a0", flexShrink: 0 }} />
              <div style={{ flex: 1, fontSize: 12, fontWeight: 500 }}>{tx.name}</div>
              <div style={{ fontSize: 10, color: "#444456", fontFamily: "monospace" }}>
                {new Date(tx.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </div>
              <div style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: tx.type === "income" ? "#22c55e" : "#ef4444" }}>
                {tx.type === "income" ? "+" : ""}{tx.amount.toLocaleString()} MMK
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── PROFILE SCREEN ───────────────────────────────────────────────────────────
function ProfileScreen({ user, onLogout, updateUser }: any) {
  const [ptab,    setPtab]   = useState("overview");
  const [notifs,  setNotifs] = useState({ budget: true, xp: true, streak: false, transactions: true, email: true });
  const [s2,      setS2]     = useState({ darkMode: true, animations: true });
  const [twoFA,   setTwoFA]  = useState(false);

  const PTABS = ["overview","history","settings","notifications","security"];

  return (
    <div style={{ padding: "16px 20px" }}>
      {/* Hero */}
      <div style={{ ...CARD, padding: 18, marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(34,197,94,.1)", border: "2px solid rgba(34,197,94,.3)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace", fontSize: 20, fontWeight: 700, color: "#22c55e", flexShrink: 0 }}>
            {(user?.name || "U").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 17, fontWeight: 700 }}>{user?.name || "User"}</div>
            <div style={{ fontSize: 11, color: "#22c55e", fontWeight: 600, marginTop: 2, fontFamily: "monospace" }}>Saver Rank — Gold III</div>
            <div style={{ fontSize: 10, color: "#444456", marginTop: 2 }}>{user?.email}</div>
          </div>
          <button onClick={onLogout} style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "1px solid #2e2e35", borderRadius: 7, padding: "6px 11px", fontSize: 11, fontWeight: 600, color: "#ef4444", cursor: "pointer", fontFamily: "inherit" }}>
            <Ic n="logout" s={11} c="#ef4444" /> Logout
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 14 }}>
          {[
            { val: String(user?.level || 1), lbl: "Level",  color: "#f0f0f5" },
            { val: String(user?.streak|| 0), lbl: "Streak", color: "#f59e0b" },
            { val: String(user?.xp    || 0), lbl: "XP",     color: "#a855f7" },
            { val: "82",                     lbl: "Score",   color: "#22c55e" },
          ].map((s) => (
            <div key={s.lbl} style={{ background: "#111114", border: "1px solid #242428", borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
              <div style={{ fontFamily: "monospace", fontSize: 17, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "#444456", marginTop: 3 }}>{s.lbl}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 5 }}>
          <span style={{ fontWeight: 600 }}>Level {user?.level || 1} Progress</span>
          <span style={{ fontFamily: "monospace", color: "#444456" }}>{user?.xp || 0} / {(user?.level || 1) * 100} XP</span>
        </div>
        <div style={{ height: 6, background: "#242428", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${Math.min(((user?.xp || 0) % 100), 100)}%`, background: "#22c55e", borderRadius: 3 }} />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #242428", marginBottom: 14, overflowX: "auto" }}>
        {PTABS.map((t) => (
          <button key={t} onClick={() => setPtab(t)} style={{ padding: "9px 14px", fontSize: 10, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", color: ptab === t ? "#f0f0f5" : "#444456", cursor: "pointer", borderBottom: `1.5px solid ${ptab === t ? "#22c55e" : "transparent"}`, background: "none", border: "none", borderBottom: `1.5px solid ${ptab === t ? "#22c55e" : "transparent"}`, fontFamily: "inherit", marginBottom: -1, whiteSpace: "nowrap" }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {ptab === "overview" && (
        <Sec title="Account Details">
          <Row icon="user"   iconColor="#3b82f6" iconBg="rgba(59,130,246,.1)"  name={user?.name  || "User"} desc="Display name"    right={<><span style={{ fontSize: 10, color: "#444456" }}>Edit</span><Ic n="chevron" s={12} c="#444456" /></>} />
          <Row icon="mail"   iconColor="#a855f7" iconBg="rgba(168,85,247,.1)" name={user?.email || "—"}    desc="Email · Verified" right={<Ic n="chevron" s={12} c="#444456" />} />
          <Row icon="dollar" iconColor="#22c55e" iconBg="rgba(34,197,94,.1)"  name="Default Currency"     desc="Myanmar Kyat (MMK)" right={<><span style={{ fontSize: 10, color: "#444456" }}>MMK</span><Ic n="chevron" s={12} c="#444456" /></>} />
        </Sec>
      )}

      {ptab === "history" && (
        <div style={{ fontSize: 11, color: "#444456", textAlign: "center", padding: "20px 0" }}>
          Full history is available in the Analytics tab
        </div>
      )}

      {ptab === "settings" && (
        <>
          <Sec title="Appearance">
            <Row icon="sun"    name="Dark Mode"   desc="Always on" right={<Toggle on={s2.darkMode}    onToggle={() => setS2((v) => ({ ...v, darkMode:    !v.darkMode    }))} />} />
            <Row icon="health" name="Animations"  desc="XP effects" right={<Toggle on={s2.animations} onToggle={() => setS2((v) => ({ ...v, animations: !v.animations }))} />} />
            <Row icon="phone"  name="Language"    desc="Interface language" right={<><span style={{ fontSize: 10, color: "#444456" }}>English</span><Ic n="chevron" s={12} c="#444456" /></>} />
          </Sec>
          <Sec title="Budget">
            <Row icon="target" iconColor="#22c55e" iconBg="rgba(34,197,94,.1)"  name="Monthly Goal"   desc="Ideal spending target"  right={<><span style={{ fontSize: 10, fontFamily: "monospace", color: "#444456" }}>{(user?.goalBudget || 175000).toLocaleString()} MMK</span><Ic n="chevron" s={12} c="#444456" /></>} />
            <Row icon="warn"   iconColor="#f59e0b" iconBg="rgba(245,158,11,.1)" name="Emergency Limit" desc="Maximum allowed" right={<><span style={{ fontSize: 10, fontFamily: "monospace", color: "#444456" }}>{(user?.emergencyLimit || 225000).toLocaleString()} MMK</span><Ic n="chevron" s={12} c="#444456" /></>} />
          </Sec>
          <Sec title="Data">
            <Row icon="download" name="Export Transactions" desc="Download CSV" right={<Ic n="chevron" s={12} c="#444456" />} />
          </Sec>
        </>
      )}

      {ptab === "notifications" && (
        <>
          <Sec title="Push Notifications">
            <Row icon="bell"   iconColor="#22c55e" iconBg="rgba(34,197,94,.1)"  name="Budget Warnings"     desc="Alert when near limit"    right={<Toggle on={notifs.budget}       onToggle={() => setNotifs((n) => ({ ...n, budget:       !n.budget       }))} />} />
            <Row icon="star"   iconColor="#a855f7" iconBg="rgba(168,85,247,.1)" name="XP Rewards"          desc="Notify on XP earned"       right={<Toggle on={notifs.xp}           onToggle={() => setNotifs((n) => ({ ...n, xp:           !n.xp           }))} />} />
            <Row icon="zap"    iconColor="#f59e0b" iconBg="rgba(245,158,11,.1)" name="Streak Reminders"    desc="Daily reminder"            right={<Toggle on={notifs.streak}       onToggle={() => setNotifs((n) => ({ ...n, streak:       !n.streak       }))} />} />
            <Row icon="wallet" name="Transaction Alerts" desc="Every new expense"  right={<Toggle on={notifs.transactions} onToggle={() => setNotifs((n) => ({ ...n, transactions: !n.transactions }))} />} />
          </Sec>
          <Sec title="Channels">
            <Row icon="mail" name="Gmail Alerts"  desc={user?.email || "—"} right={<Toggle on={notifs.email} onToggle={() => setNotifs((n) => ({ ...n, email: !n.email }))} />} />
            <Row icon="send" iconColor="#3b82f6" iconBg="rgba(59,130,246,.1)" name="Telegram Bot" desc="Connect @MMKQuestBot" right={<><span style={{ fontSize: 10, color: "#444456" }}>Not connected</span><Ic n="chevron" s={12} c="#444456" /></>} />
          </Sec>
        </>
      )}

      {ptab === "security" && (
        <>
          <Sec title="Authentication">
            <Row icon="lock"   iconColor="#22c55e" iconBg="rgba(34,197,94,.1)"  name="Change Password"  desc="Last changed 32 days ago" right={<Ic n="chevron" s={12} c="#444456" />} />
            <Row icon="shield" iconColor="#f59e0b" iconBg="rgba(245,158,11,.1)" name="Two-Factor Auth"  desc="Extra security layer"     right={<Toggle on={twoFA} onToggle={() => setTwoFA(!twoFA)} />} />
            <Row icon="phone"  name="Active Sessions" desc="Manage devices"    right={<><span style={{ fontSize: 10, fontFamily: "monospace", color: "#444456" }}>2 devices</span><Ic n="chevron" s={12} c="#444456" /></>} />
          </Sec>
          <Sec title="Danger Zone">
            {[
              { icon: "warn",   label: "Reset all XP and progress"    },
              { icon: "trash",  label: "Delete all transaction data"   },
              { icon: "logout", label: "Delete account permanently"    },
            ].map((d) => (
              <button key={d.label} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "12px 15px", background: "none", border: "none", borderBottom: "1px solid #242428", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 500, color: "#ef4444", textAlign: "left" }}>
                <Ic n={d.icon} s={13} c="#ef4444" /> {d.label}
              </button>
            ))}
          </Sec>
        </>
      )}
    </div>
  );
}

// ─── TABS CONFIG ──────────────────────────────────────────────────────────────
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
  const [tab,   setTab]   = useState("home");
  const [modal, setModal] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/auth");
  }, [user, loading, router]);

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
  };

  const xpPct = Math.min((user.xp || 0) % 100, 100);

  return (
    <div style={{ background: "#0a0a0c", fontFamily: "'Inter', sans-serif", color: "#f0f0f5", minHeight: "100vh" }}>


      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 20px", background: "#111114", borderBottom: "1px solid #242428", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 15, fontWeight: 700, letterSpacing: ".05em" }}>
          MMK<span style={{ color: "#22c55e" }}>Quest</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <div style={{ fontSize: 9, color: "#444456", fontFamily: "monospace" }}>XP {user.xp || 0}/{(user.level || 1) * 100}</div>
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
      <div style={{ display: "flex", background: "#111114", borderBottom: "1px solid #242428", padding: "0 20px", position: "sticky", top: 53, zIndex: 49, overflowX: "auto" }}>
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "11px 13px", fontSize: 10, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: tab === t.id ? "#f0f0f5" : "#444456", cursor: "pointer", background: "none", border: "none", borderBottom: `1.5px solid ${tab === t.id ? "#22c55e" : "transparent"}`, fontFamily: "inherit", marginBottom: -1, whiteSpace: "nowrap" }}>
            <Ic n={t.icon} s={11} c={tab === t.id ? "#f0f0f5" : "#444456"} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ maxHeight: "calc(100vh - 96px)", overflowY: "auto" }}>
        {tab === "home"      && <HomeScreen      user={user} txData={txData} />}
        {tab === "wallet"    && <WalletScreen    txData={txData} />}
        {tab === "goals"     && <GoalsScreen     user={user} txData={txData} updateUser={updateUserProfile} />}
        {tab === "game"      && <GameScreen      user={user} />}
        {tab === "analytics" && <AnalyticsScreen txData={txData} />}
        {tab === "profile"   && <ProfileScreen   user={user} onLogout={handleLogout} updateUser={updateUserProfile} />}
      </div>

      <AddSpendModal open={modal} onClose={() => setModal(false)} onAdd={handleAdd} />
    </div>
  );
}
