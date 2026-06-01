// app/auth/page.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

function Ic({ n, s = 16, c = "currentColor" }: { n: string; s?: number; c?: string }) {
  const paths: Record<string, React.ReactNode> = {
    eye:     <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
    eyeoff:  <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>,
    mail:    <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>,
    lock:    <><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>,
    user:    <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    arrow:   <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>,
    check:   <polyline points="20 6 9 17 4 12"/>,
    warn:    <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
    refresh: <><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></>,
    google:  <><path d="M20.3 12.2c0-.6-.1-1.2-.2-1.8H12v3.4h4.7c-.2 1.1-.9 2-1.8 2.6v2.2h2.9c1.7-1.6 2.7-3.9 2.7-6.4z" fill="#4285F4" stroke="none"/><path d="M12 21c2.4 0 4.4-.8 5.8-2.1l-2.9-2.2c-.8.5-1.8.8-2.9.8-2.2 0-4.1-1.5-4.8-3.5H4.3v2.3C5.7 19.1 8.7 21 12 21z" fill="#34A853" stroke="none"/><path d="M7.2 14c-.2-.5-.3-1-.3-1.5s.1-1.1.3-1.5V8.7H4.3C3.5 10.1 3 11.5 3 13s.5 2.9 1.3 4.2L7.2 14z" fill="#FBBC05" stroke="none"/><path d="M12 7.8c1.2 0 2.3.4 3.2 1.2l2.4-2.4C16.4 5.2 14.4 4.4 12 4.4c-3.3 0-6.3 1.9-7.7 4.6l2.9 2.3c.7-2 2.6-3.5 4.8-3.5z" fill="#EA4335" stroke="none"/></>,
  };
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c}
      strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      {paths[n]}
    </svg>
  );
}

function OTPInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const refs = Array.from({ length: 6 }, () => useRef<HTMLInputElement>(null));
  const digits = value.split("").concat(Array(6).fill("")).slice(0, 6);
  const handle = (i: number, v: string) => {
    if (!/^\d*$/.test(v)) return;
    const next = [...digits]; next[i] = v.slice(-1);
    const joined = next.join(""); onChange(joined);
    if (v && i < 5) refs[i + 1].current?.focus();
  };
  const onKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs[i - 1].current?.focus();
  };
  const onPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted);
    refs[Math.min(pasted.length, 5)].current?.focus();
  };
  return (
    <div className="flex gap-2 justify-center">
      {digits.map((d, i) => (
        <input key={i} ref={refs[i]} value={d} maxLength={1}
          onPaste={i === 0 ? onPaste : undefined}
          onChange={(e) => handle(i, e.target.value)}
          onKeyDown={(e) => onKeyDown(i, e)}
          className="w-11 h-14 text-center text-xl font-bold bg-[#0a0a0c] border border-[#2e2e35] rounded-[8px] text-[#f0f0f5] focus:border-[#22c55e] focus:outline-none transition-colors"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        />
      ))}
    </div>
  );
}

type Step = "form" | "verify";
type Mode = "login" | "register";

export default function AuthPage() {
  const router   = useRouter();
  const { user, loading, login, register, loginWithGoogle,
          sendVerificationCode, verifyCode, error, clearError } = useAuth();

  const [mode,      setMode]     = useState<Mode>("login");
  const [step,      setStep]     = useState<Step>("form");
  const [name,      setName]     = useState("");
  const [email,     setEmail]    = useState("");
  const [password,  setPassword] = useState("");
  const [code,      setCode]     = useState("");
  const [showPass,  setShowPass] = useState(false);
  const [busy,      setBusy]     = useState(false);
  const [localErr,  setLocalErr] = useState("");
  const [countdown, setCd]       = useState(0);
  const [success,   setSuccess]  = useState(false);

  // ── Redirect if already logged in ──────────────────────────────────────────
  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  // ── Countdown timer ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCd((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const err = localErr || error || "";

  const validate = () => {
    clearError(); setLocalErr("");
    if (mode === "register" && !name.trim()) { setLocalErr("Full name is required"); return false; }
    if (!email.includes("@"))               { setLocalErr("Enter a valid email"); return false; }
    if (password.length < 6)               { setLocalErr("Password must be at least 6 characters"); return false; }
    return true;
  };

  // ── Submit form (Step 1) ────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;
    setBusy(true); setLocalErr("");
    try {
      if (mode === "login") {
        await login(email, password);
        // router.replace handled by useEffect watching user state
      } else {
        await sendVerificationCode(email, name);
        setStep("verify");
        setCd(60);
      }
    } catch (e: any) {
      setLocalErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  // ── Verify code (Step 2) ────────────────────────────────────────────────────
  const handleVerify = async () => {
    if (code.length < 6) { setLocalErr("Enter the full 6-digit code"); return; }
    setBusy(true); setLocalErr("");
    try {
      // 1. Check the code is correct
      await verifyCode(email, code, name, true);
      // 2. Create Firebase account
      await register(email, password, name);
      // 3. Show success — useEffect watching user will redirect automatically
      setSuccess(true);
    } catch (e: any) {
      setLocalErr(e.message);
      setBusy(false);
    }
  };

  // ── Resend code ─────────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (countdown > 0) return;
    setBusy(true);
    try {
      await sendVerificationCode(email, name);
      setCode(""); setCd(60); setLocalErr("");
    } catch (e: any) { setLocalErr(e.message); }
    finally { setBusy(false); }
  };

  // ── Google ──────────────────────────────────────────────────────────────────
  const handleGoogle = async () => {
    setBusy(true); setLocalErr("");
    try {
      await loginWithGoogle();
      // useEffect watching user will redirect
    } catch (e: any) {
      setLocalErr(e.message);
      setBusy(false);
    }
  };

  // Loading spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center">
        <div className="text-[#444456] text-sm" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          Loading…
        </div>
      </div>
    );
  }

  const inp = (err?: boolean) =>
    `w-full bg-[#0a0a0c] border ${err ? "border-red-500" : "border-[#2e2e35]"} rounded-[8px] px-[12px] py-[10px] text-[13px] font-medium text-[#f0f0f5] outline-none focus:border-[#22c55e] transition-colors`;

  return (
    <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center px-4"
      style={{ fontFamily: "'Syne', sans-serif" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        input::placeholder { color: #444456; }
        @keyframes fadein { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .fadein { animation: fadein 0.4s ease; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}</style>

      <div className="w-full max-w-[400px] fadein">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-[26px] font-bold mb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            MMK<span className="text-[#22c55e]">Quest</span>
          </div>
          <div className="text-[12px] text-[#444456]">Myanmar&apos;s gamified finance tracker</div>
          <div className="flex justify-center flex-wrap gap-2 mt-3">
            {["KBZ Pay","WavePay","CB Pay","UAB Pay","AYA Pay"].map(w => (
              <span key={w} className="text-[9px] font-semibold px-2 py-1 rounded-full border border-[#242428] text-[#444456]">{w}</span>
            ))}
          </div>
        </div>

        {/* Card */}
        <div className="bg-[#161619] border border-[#242428] rounded-[14px] p-7">

          {step === "form" ? (
            <>
              {/* Tabs */}
              <div className="flex border-b border-[#242428] mb-6 -mx-7 px-7">
                {(["login","register"] as Mode[]).map(m => (
                  <button key={m} onClick={() => { setMode(m); setLocalErr(""); clearError(); }}
                    className="flex-1 pb-3 text-[11px] font-semibold tracking-widest uppercase transition-colors"
                    style={{ color: mode === m ? "#f0f0f5" : "#444456", borderBottom: `1.5px solid ${mode === m ? "#22c55e" : "transparent"}`, background: "none", border: "none", borderBottom: `1.5px solid ${mode === m ? "#22c55e" : "transparent"}`, cursor: "pointer", fontFamily: "inherit" }}>
                    {m === "login" ? "Sign In" : "Create Account"}
                  </button>
                ))}
              </div>

              {/* Name (register only) */}
              {mode === "register" && (
                <div className="mb-3">
                  <label className="block text-[10px] font-semibold tracking-widest uppercase text-[#444456] mb-1.5">Full Name</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40"><Ic n="user" s={14}/></span>
                    <input className={inp() + " pl-9"} placeholder="e.g. Aung Ko Ko"
                      value={name} onChange={e => setName(e.target.value)} />
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="mb-3">
                <label className="block text-[10px] font-semibold tracking-widest uppercase text-[#444456] mb-1.5">Email</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40"><Ic n="mail" s={14}/></span>
                  <input className={inp() + " pl-9"} type="email" placeholder="you@example.com"
                    value={email} onChange={e => setEmail(e.target.value)} />
                </div>
              </div>

              {/* Password */}
              <div className="mb-4">
                <div className="flex justify-between mb-1.5">
                  <label className="text-[10px] font-semibold tracking-widest uppercase text-[#444456]">Password</label>
                  {mode === "login" && <span className="text-[10px] text-[#3b82f6] cursor-pointer">Forgot password?</span>}
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40"><Ic n="lock" s={14}/></span>
                  <input className={inp() + " pl-9 pr-10"} type={showPass ? "text" : "password"}
                    placeholder="••••••••" value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSubmit()} />
                  <button onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-70"
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}>
                    <Ic n={showPass ? "eyeoff" : "eye"} s={14}/>
                  </button>
                </div>
              </div>

              {/* Error */}
              {err && (
                <div className="flex items-center gap-2 text-[11px] text-red-400 mb-3">
                  <Ic n="warn" s={11} c="#f87171"/> {err}
                </div>
              )}

              {/* Submit */}
              <button onClick={handleSubmit} disabled={busy}
                className="w-full flex items-center justify-center gap-2 bg-[#22c55e] text-black font-bold text-[13px] rounded-[8px] py-3 mb-4 transition-opacity disabled:opacity-60"
                style={{ cursor: busy ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                {busy
                  ? <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full spin"/>
                  : <>{mode === "login" ? "Sign In" : "Send Verification Code"} <Ic n="arrow" s={14} c="#000"/></>}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-[#242428]"/>
                <span className="text-[10px] text-[#444456]">or continue with</span>
                <div className="flex-1 h-px bg-[#242428]"/>
              </div>

              {/* Google */}
              <button onClick={handleGoogle} disabled={busy}
                className="w-full flex items-center justify-center gap-2 bg-[#1c1c20] border border-[#2e2e35] rounded-[8px] py-2.5 text-[12px] font-semibold text-[#f0f0f5] transition-opacity hover:opacity-80 disabled:opacity-50"
                style={{ cursor: busy ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                <Ic n="google" s={16}/> Continue with Google
              </button>
            </>
          ) : (
            /* ── VERIFY STEP ── */
            <>
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-full bg-[#22c55e]/10 border border-[#22c55e]/30 flex items-center justify-center mx-auto mb-3">
                  <Ic n="mail" s={20} c="#22c55e"/>
                </div>
                <div className="text-[15px] font-bold mb-1">Check your Gmail</div>
                <div className="text-[12px] text-[#8888a0]">
                  We sent a 6-digit code to<br/>
                  <span className="text-[#f0f0f5] font-semibold">{email}</span>
                </div>
              </div>

              <OTPInput value={code} onChange={setCode}/>

              {err && (
                <div className="flex items-center justify-center gap-2 text-[11px] text-red-400 mt-3">
                  <Ic n="warn" s={11} c="#f87171"/> {err}
                </div>
              )}

              {success ? (
                <div className="flex items-center justify-center gap-2 text-[12px] text-[#22c55e] mt-4 font-semibold">
                  <Ic n="check" s={13} c="#22c55e"/> Account created! Redirecting to dashboard…
                </div>
              ) : (
                <button onClick={handleVerify} disabled={busy || code.length < 6}
                  className="w-full flex items-center justify-center gap-2 bg-[#22c55e] text-black font-bold text-[13px] rounded-[8px] py-3 mt-4 transition-opacity disabled:opacity-40"
                  style={{ cursor: (busy || code.length < 6) ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                  {busy
                    ? <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full spin"/>
                    : <><Ic n="check" s={14} c="#000"/> Verify & Create Account</>}
                </button>
              )}

              <div className="flex items-center justify-between mt-4">
                <button onClick={() => { setStep("form"); setCode(""); setLocalErr(""); clearError(); }}
                  className="text-[11px] text-[#444456] hover:text-[#8888a0]"
                  style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
                  ← Back
                </button>
                <button onClick={handleResend} disabled={countdown > 0 || busy}
                  className="flex items-center gap-1.5 text-[11px] font-semibold disabled:opacity-40"
                  style={{ color: countdown > 0 ? "#444456" : "#3b82f6", background: "none", border: "none", cursor: countdown > 0 ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                  <Ic n="refresh" s={11} c={countdown > 0 ? "#444456" : "#3b82f6"}/>
                  {countdown > 0 ? `Resend in ${countdown}s` : "Resend code"}
                </button>
              </div>
            </>
          )}
        </div>

        <div className="text-center mt-5 text-[10px] text-[#444456]">
          Secured with Firebase Auth · 256-bit encryption
        </div>
      </div>
    </div>
  );
}
