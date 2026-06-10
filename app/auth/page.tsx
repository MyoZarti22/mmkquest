// app/auth/page.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

// ─── ICON ─────────────────────────────────────────────────────────────────────
function Ic({ n, s = 16, c = "currentColor" }: { n: string; s?: number; c?: string }) {
  const paths: Record<string, React.ReactNode> = {
    eye:    <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
    eyeoff: <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>,
    mail:   <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>,
    lock:   <><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>,
    user:   <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    arrow:  <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>,
    check:  <polyline points="20 6 9 17 4 12"/>,
    warn:   <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
    refresh:<><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></>,
    google: <><path d="M20.3 12.2c0-.6-.1-1.2-.2-1.8H12v3.4h4.7c-.2 1.1-.9 2-1.8 2.6v2.2h2.9c1.7-1.6 2.7-3.9 2.7-6.4z" fill="#4285F4" stroke="none"/><path d="M12 21c2.4 0 4.4-.8 5.8-2.1l-2.9-2.2c-.8.5-1.8.8-2.9.8-2.2 0-4.1-1.5-4.8-3.5H4.3v2.3C5.7 19.1 8.7 21 12 21z" fill="#34A853" stroke="none"/><path d="M7.2 14c-.2-.5-.3-1-.3-1.5s.1-1.1.3-1.5V8.7H4.3C3.5 10.1 3 11.5 3 13s.5 2.9 1.3 4.2L7.2 14z" fill="#FBBC05" stroke="none"/><path d="M12 7.8c1.2 0 2.3.4 3.2 1.2l2.4-2.4C16.4 5.2 14.4 4.4 12 4.4c-3.3 0-6.3 1.9-7.7 4.6l2.9 2.3c.7-2 2.6-3.5 4.8-3.5z" fill="#EA4335" stroke="none"/></>,
  };
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c}
      strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      {paths[n]}
    </svg>
  );
}

// ─── OTP INPUT ────────────────────────────────────────────────────────────────
function OTPInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const refs = [
    useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null),
  ];
  const digits = value.split("").concat(Array(6).fill("")).slice(0, 6);

  const handle = (i: number, v: string) => {
    if (!/^\d*$/.test(v)) return;
    const next = [...digits]; next[i] = v.slice(-1);
    onChange(next.join(""));
    if (v && i < 5) refs[i + 1].current?.focus();
  };
  const onKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs[i - 1].current?.focus();
  };
  const onPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const p = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(p);
    refs[Math.min(p.length, 5)].current?.focus();
  };

  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
      {digits.map((d, i) => (
        <input
          key={i} ref={refs[i]} value={d} maxLength={1}
          onPaste={i === 0 ? onPaste : undefined}
          onChange={(e) => handle(i, e.target.value)}
          onKeyDown={(e) => onKeyDown(i, e)}
          style={{
            width: 46, height: 56, textAlign: "center",
            fontSize: 22, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
            background: "#0a0a0c", border: `1.5px solid ${d ? "#22c55e" : "#2e2e35"}`,
            borderRadius: 8, color: "#f0f0f5", outline: "none",
          }}
        />
      ))}
    </div>
  );
}

// ─── MAIN AUTH PAGE ───────────────────────────────────────────────────────────
type Mode = "login" | "register";
type Step = "form"  | "verify";

export default function AuthPage() {
  const router = useRouter();
  const { user, loading, login, register, loginWithGoogle,
          sendVerificationCode, verifyCode, error, clearError } = useAuth();

  const [mode,     setMode]    = useState<Mode>("login");
  const [step,     setStep]    = useState<Step>("form");
  const [name,     setName]    = useState("");
  const [email,    setEmail]   = useState("");
  const [password, setPass]    = useState("");
  const [code,     setCode]    = useState("");
  const [showPass, setShowP]   = useState(false);
  const [busy,     setBusy]    = useState(false);
  const [localErr, setLErr]    = useState("");
  const [countdown,setCd]      = useState(0);
  const [success,  setSuccess] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [user, loading, router]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCd((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const err = localErr || error || "";

  const validate = () => {
    clearError(); setLErr("");
    if (mode === "register" && !name.trim()) { setLErr("Full name is required"); return false; }
    if (!email.includes("@"))               { setLErr("Enter a valid email");    return false; }
    if (password.length < 6)               { setLErr("Password min 6 chars");   return false; }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setBusy(true); setLErr("");
    try {
      if (mode === "login") {
        await login(email, password);
        // Redirect immediately after login
        router.replace("/dashboard");
      } else {
        await sendVerificationCode(email, name);
        setStep("verify"); setCd(60);
      }
    } catch (e: any) {
      setLErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  const handleVerify = async () => {
    if (code.length < 6) { setLErr("Enter the full 6-digit code"); return; }
    setBusy(true); setLErr("");
    try {
      await verifyCode(email, code, name, true);
      await register(email, password, name);
      setSuccess(true);
      // Redirect after short delay to show success message
      setTimeout(() => router.replace("/dashboard"), 1200);
    } catch (e: any) {
      setLErr(e.message);
      setBusy(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setBusy(true);
    try {
      await sendVerificationCode(email, name);
      setCode(""); setCd(60); setLErr("");
    } catch (e: any) { setLErr(e.message); }
    finally { setBusy(false); }
  };

  const handleGoogle = async () => {
    setBusy(true); setLErr("");
    try {
      await loginWithGoogle();
      router.replace("/dashboard");
    } catch (e: any) {
      setLErr(e.message);
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0c", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#444456", fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>Loading…</div>
      </div>
    );
  }

  // Input style
  const inp: React.CSSProperties = {
    width: "100%", background: "#0a0a0c",
    border: "1px solid #2e2e35", borderRadius: 8,
    padding: "11px 14px 11px 38px",
    fontSize: 13, fontWeight: 500,
    color: "#f0f0f5", fontFamily: "'Inter', sans-serif",
    outline: "none", boxSizing: "border-box",
  };

  // Spinner
  const spinner = (
    <span style={{ width: 16, height: 16, border: "2px solid", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block", animation: "spin 1s linear infinite" }} />
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0c", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", fontFamily: "'Inter', sans-serif", color: "#f0f0f5" }}>
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadein  { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        input:focus { border-color: #22c55e !important; }
        input::placeholder { color: #444456; }
      `}</style>

      <div style={{ width: "100%", maxWidth: 400, animation: "fadein .4s ease" }}>

        {/* ── LOGO ── */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 28, fontWeight: 700, letterSpacing: ".05em", marginBottom: 6 }}>
            MMK<span style={{ color: "#22c55e" }}>Quest</span>
          </div>
          <div style={{ fontSize: 12, color: "#444456", marginBottom: 12 }}>
            Myanmar&apos;s gamified finance tracker
          </div>
          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 6 }}>
            {["KBZ Pay", "WavePay", "CB Pay", "UAB Pay", "AYA Pay"].map((w) => (
              <span key={w} style={{ fontSize: 9, fontWeight: 600, padding: "3px 8px", borderRadius: 20, border: "1px solid #242428", color: "#444456" }}>{w}</span>
            ))}
          </div>
        </div>

        {/* ── CARD ── */}
        <div style={{ background: "#161619", border: "1px solid #242428", borderRadius: 14, padding: 28 }}>

          {step === "form" ? (
            <>
              {/* Tabs */}
              <div style={{ display: "flex", borderBottom: "1px solid #242428", marginBottom: 24, marginLeft: -28, marginRight: -28, paddingLeft: 28, paddingRight: 28 }}>
                {(["login", "register"] as Mode[]).map((m) => (
                  <button key={m} onClick={() => { setMode(m); setLErr(""); clearError(); }}
                    style={{ flex: 1, paddingBottom: 12, background: "none", border: "none", borderBottom: `1.5px solid ${mode === m ? "#22c55e" : "transparent"}`, fontSize: 11, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: mode === m ? "#f0f0f5" : "#444456", cursor: "pointer", fontFamily: "inherit", marginBottom: -1 }}>
                    {m === "login" ? "Sign In" : "Create Account"}
                  </button>
                ))}
              </div>

              {/* Name field (register only) */}
              {mode === "register" && (
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: "block", fontSize: 10, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "#444456", marginBottom: 6 }}>Full Name</label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", opacity: .4 }}><Ic n="user" s={14} /></span>
                    <input style={inp} placeholder="e.g. Aung Ko Ko" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                </div>
              )}

              {/* Email */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 10, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "#444456", marginBottom: 6 }}>Email</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", opacity: .4 }}><Ic n="mail" s={14} /></span>
                  <input style={inp} type="email" placeholder="you@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>

              {/* Password */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <label style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "#444456" }}>Password</label>
                  {mode === "login" && <span style={{ fontSize: 10, color: "#3b82f6", cursor: "pointer" }}>Forgot password?</span>}
                </div>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", opacity: .4 }}><Ic n="lock" s={14} /></span>
                  <input style={{ ...inp, paddingRight: 40 }} type={showPass ? "text" : "password"} placeholder="••••••••"
                    value={password} onChange={(e) => setPass(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
                  <button onClick={() => setShowP(!showPass)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", opacity: .5 }}>
                    <Ic n={showPass ? "eyeoff" : "eye"} s={14} />
                  </button>
                </div>
              </div>

              {/* Error */}
              {err && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#f87171", marginBottom: 12 }}>
                  <Ic n="warn" s={11} c="#f87171" /> {err}
                </div>
              )}

              {/* Submit button */}
              <button onClick={handleSubmit} disabled={busy}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#22c55e", color: "#000", border: "none", borderRadius: 8, padding: "12px 16px", fontSize: 13, fontWeight: 700, cursor: busy ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: busy ? .7 : 1, marginBottom: 16 }}>
                {busy ? spinner : <>{mode === "login" ? "Sign In" : "Send Verification Code"} <Ic n="arrow" s={14} c="#000" /></>}
              </button>

              {/* Divider */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ flex: 1, height: 1, background: "#242428" }} />
                <span style={{ fontSize: 10, color: "#444456" }}>or continue with</span>
                <div style={{ flex: 1, height: 1, background: "#242428" }} />
              </div>

              {/* Google */}
              <button onClick={handleGoogle} disabled={busy}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#1c1c20", border: "1px solid #2e2e35", borderRadius: 8, padding: "10px 16px", fontSize: 12, fontWeight: 600, color: "#f0f0f5", cursor: busy ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: busy ? .6 : 1 }}>
                <Ic n="google" s={16} /> Continue with Google
              </button>
            </>
          ) : (
            /* ── VERIFY STEP ── */
            <>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(34,197,94,.1)", border: "1px solid rgba(34,197,94,.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                  <Ic n="mail" s={22} c="#22c55e" />
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Check your Gmail</div>
                <div style={{ fontSize: 12, color: "#8888a0", lineHeight: 1.6 }}>
                  We sent a 6-digit code to<br />
                  <strong style={{ color: "#f0f0f5" }}>{email}</strong>
                </div>
              </div>

              <OTPInput value={code} onChange={setCode} />

              {err && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 11, color: "#f87171", marginTop: 12 }}>
                  <Ic n="warn" s={11} c="#f87171" /> {err}
                </div>
              )}

              {success ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "#22c55e", marginTop: 16 }}>
                  <Ic n="check" s={13} c="#22c55e" /> Account created! Redirecting…
                </div>
              ) : (
                <button onClick={handleVerify} disabled={busy || code.length < 6}
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#22c55e", color: "#000", border: "none", borderRadius: 8, padding: "12px 16px", fontSize: 13, fontWeight: 700, cursor: (busy || code.length < 6) ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: (busy || code.length < 6) ? .5 : 1, marginTop: 16 }}>
                  {busy ? spinner : <><Ic n="check" s={14} c="#000" /> Verify & Create Account</>}
                </button>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
                <button onClick={() => { setStep("form"); setCode(""); setLErr(""); clearError(); }}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "#444456", fontFamily: "inherit" }}>
                  ← Back
                </button>
                <button onClick={handleResend} disabled={countdown > 0 || busy}
                  style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: countdown > 0 ? "not-allowed" : "pointer", fontSize: 11, fontWeight: 600, color: countdown > 0 ? "#444456" : "#3b82f6", fontFamily: "inherit", opacity: countdown > 0 ? .5 : 1 }}>
                  <Ic n="refresh" s={11} c={countdown > 0 ? "#444456" : "#3b82f6"} />
                  {countdown > 0 ? `Resend in ${countdown}s` : "Resend code"}
                </button>
              </div>
            </>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 10, color: "#444456" }}>
          Secured with Firebase Auth · 256-bit encryption
        </div>
      </div>
    </div>
  );
}
