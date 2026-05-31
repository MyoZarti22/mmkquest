// lib/nodemailer.ts
// Sends emails via Gmail using App Password
import nodemailer from "nodemailer";

// Create reusable transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER!,
    pass: process.env.GMAIL_APP_PASSWORD!,
  },
});

// ─── VERIFICATION CODE EMAIL ─────────────────────────────────────────────────
export async function sendVerificationEmail(toEmail: string, code: string, name?: string) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#0a0a0c;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0c;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#161619;border:1px solid #242428;border-radius:14px;overflow:hidden;max-width:480px;width:100%;">
          
          <!-- Header -->
          <tr>
            <td style="background:#111114;padding:24px 32px;border-bottom:1px solid #242428;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="font-family:'Courier New',monospace;font-size:20px;font-weight:700;letter-spacing:0.05em;color:#f0f0f5;">
                      MMK<span style="color:#22c55e;">Quest</span>
                    </span>
                  </td>
                  <td align="right">
                    <span style="font-size:11px;color:#444456;letter-spacing:0.1em;text-transform:uppercase;">Email Verification</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="font-size:15px;color:#8888a0;margin:0 0 8px;">Hello, <span style="color:#f0f0f5;font-weight:600;">${name || "there"}</span></p>
              <p style="font-size:13px;color:#444456;margin:0 0 28px;line-height:1.6;">
                Welcome to MMKQuest — Myanmar's gamified finance tracker.<br>
                Enter this code to verify your email and activate your account.
              </p>
              
              <!-- Code Box -->
              <div style="background:#111114;border:1px solid #22c55e30;border-radius:12px;padding:28px;text-align:center;margin-bottom:24px;">
                <p style="font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#444456;margin:0 0 12px;">Your verification code</p>
                <div style="font-family:'Courier New',monospace;font-size:40px;font-weight:700;letter-spacing:0.2em;color:#22c55e;margin:0;">${code}</div>
                <p style="font-size:11px;color:#444456;margin:12px 0 0;">Expires in 10 minutes</p>
              </div>
              
              <!-- Wallet support -->
              <div style="background:#0a0a0c;border:1px solid #242428;border-radius:8px;padding:14px;margin-bottom:20px;">
                <p style="font-size:10px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#444456;margin:0 0 10px;">Supported Myanmar Wallets</p>
                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                  ${["KBZ Pay","WavePay","CB Pay","UAB Pay","AYA Pay"].map(w => `<span style="font-size:10px;font-weight:600;padding:3px 9px;background:#161619;border:1px solid #242428;border-radius:20px;color:#8888a0;">${w}</span>`).join("\n                  ")}
                </div>
              </div>
              
              <p style="font-size:11px;color:#444456;margin:0;line-height:1.7;">
                If you didn't request this, you can safely ignore this email.<br>
                This code will expire automatically.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background:#111114;padding:16px 32px;border-top:1px solid #242428;">
              <p style="font-size:10px;color:#444456;margin:0;text-align:center;">
                MMKQuest · Myanmar's Finance RPG · Secured with Firebase Auth
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  await transporter.sendMail({
    from:    `"MMKQuest" <${process.env.GMAIL_USER}>`,
    to:      toEmail,
    subject: `${code} — Your MMKQuest Verification Code`,
    html,
    text: `Your MMKQuest verification code is: ${code}\n\nThis code expires in 10 minutes.`,
  });
}

// ─── WELCOME EMAIL (after verification) ──────────────────────────────────────
export async function sendWelcomeEmail(toEmail: string, name: string) {
  const html = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0a0a0c;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0c;padding:40px 20px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#161619;border:1px solid #242428;border-radius:14px;overflow:hidden;max-width:480px;width:100%;">
        <tr>
          <td style="background:#111114;padding:24px 32px;border-bottom:1px solid #242428;">
            <span style="font-family:'Courier New',monospace;font-size:20px;font-weight:700;color:#f0f0f5;">MMK<span style="color:#22c55e;">Quest</span></span>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <div style="text-align:center;margin-bottom:24px;">
              <div style="width:64px;height:64px;background:rgba(34,197,94,0.1);border:2px solid rgba(34,197,94,0.3);border-radius:50%;margin:0 auto 16px;line-height:64px;font-size:28px;">🎮</div>
              <h2 style="font-size:20px;font-weight:700;color:#f0f0f5;margin:0 0 8px;">Welcome to MMKQuest, ${name}!</h2>
              <p style="font-size:13px;color:#8888a0;margin:0;">Your account is verified and ready.</p>
            </div>
            
            <div style="background:#111114;border:1px solid #242428;border-radius:10px;padding:16px;margin-bottom:20px;">
              <p style="font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#444456;margin:0 0 12px;">You start with</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:6px 0;font-size:13px;color:#8888a0;">Starting Level</td>
                  <td style="padding:6px 0;font-size:13px;font-weight:700;color:#f0f0f5;text-align:right;font-family:'Courier New',monospace;">Level 1</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-size:13px;color:#8888a0;">Saver Rank</td>
                  <td style="padding:6px 0;font-size:13px;font-weight:700;color:#f59e0b;text-align:right;font-family:'Courier New',monospace;">Bronze I</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-size:13px;color:#8888a0;">Starting XP</td>
                  <td style="padding:6px 0;font-size:13px;font-weight:700;color:#22c55e;text-align:right;font-family:'Courier New',monospace;">0 / 100</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-size:13px;color:#8888a0;">Daily Streak</td>
                  <td style="padding:6px 0;font-size:13px;font-weight:700;color:#a855f7;text-align:right;font-family:'Courier New',monospace;">Day 1</td>
                </tr>
              </table>
            </div>
            
            <p style="font-size:13px;color:#8888a0;line-height:1.7;margin:0;">
              Connect your KBZ Pay, WavePay, and CB Pay to start tracking automatically.
              Set your monthly budget goal to begin earning XP.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#111114;padding:16px 32px;border-top:1px solid #242428;">
            <p style="font-size:10px;color:#444456;margin:0;text-align:center;">MMKQuest · Myanmar's Finance RPG</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await transporter.sendMail({
    from:    `"MMKQuest" <${process.env.GMAIL_USER}>`,
    to:      toEmail,
    subject: `Welcome to MMKQuest, ${name}! Your account is ready.`,
    html,
  });
}

// ─── BUDGET WARNING NOTIFICATION EMAIL ───────────────────────────────────────
export async function sendBudgetWarningEmail(
  toEmail: string,
  name: string,
  spent: number,
  goal: number,
  emergency: number
) {
  const pct = Math.round((spent / goal) * 100);
  const isOver = spent > goal;
  const isDanger = spent > emergency;
  const color = isDanger ? "#ef4444" : isOver ? "#f59e0b" : "#22c55e";
  const status = isDanger ? "BUDGET EXCEEDED" : isOver ? "SAFE ZONE WARNING" : "BUDGET ALERT";

  const html = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0a0a0c;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0c;padding:40px 20px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#161619;border:1px solid ${color}30;border-radius:14px;overflow:hidden;max-width:480px;width:100%;">
        <tr>
          <td style="background:${color}15;padding:20px 32px;border-bottom:1px solid ${color}30;">
            <table width="100%"><tr>
              <td><span style="font-family:'Courier New',monospace;font-size:18px;font-weight:700;color:#f0f0f5;">MMK<span style="color:#22c55e;">Quest</span></span></td>
              <td align="right"><span style="font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${color};background:${color}20;padding:4px 10px;border-radius:20px;border:1px solid ${color}40;">${status}</span></td>
            </tr></table>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px;">
            <p style="font-size:14px;color:#8888a0;margin:0 0 20px;">Hi <strong style="color:#f0f0f5;">${name}</strong>,</p>
            
            <!-- Progress Bar -->
            <div style="background:#111114;border:1px solid #242428;border-radius:10px;padding:16px;margin-bottom:20px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;">
                <tr>
                  <td style="font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#444456;">Monthly Budget Progress</td>
                  <td align="right" style="font-family:'Courier New',monospace;font-size:13px;font-weight:700;color:${color};">${pct}%</td>
                </tr>
              </table>
              <div style="background:#242428;border-radius:4px;height:8px;overflow:hidden;">
                <div style="background:${color};height:100%;width:${Math.min(pct, 100)}%;border-radius:4px;"></div>
              </div>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;">
                <tr>
                  <td style="font-size:12px;color:#8888a0;">Spent</td>
                  <td style="font-size:12px;color:#8888a0;">Goal</td>
                  <td style="font-size:12px;color:#8888a0;">Emergency</td>
                </tr>
                <tr>
                  <td style="font-family:'Courier New',monospace;font-size:14px;font-weight:700;color:${color};">${spent.toLocaleString()} MMK</td>
                  <td style="font-family:'Courier New',monospace;font-size:14px;font-weight:700;color:#22c55e;">${goal.toLocaleString()} MMK</td>
                  <td style="font-family:'Courier New',monospace;font-size:14px;font-weight:700;color:#f59e0b;">${emergency.toLocaleString()} MMK</td>
                </tr>
              </table>
            </div>
            
            <p style="font-size:13px;color:#8888a0;line-height:1.7;margin:0;">
              ${isDanger
                ? "You've exceeded your emergency limit. Recovery mode has been activated. Try to reduce spending for the rest of the month."
                : isOver
                  ? "You're above your goal but still below your emergency limit. You're in the Safe Zone — but watch your spending."
                  : "You're approaching your monthly goal. Stay focused to hit a Perfect Save this month!"}
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#111114;padding:16px 32px;border-top:1px solid #242428;">
            <p style="font-size:10px;color:#444456;margin:0;text-align:center;">MMKQuest · Manage notifications in Profile → Notifications</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await transporter.sendMail({
    from:    `"MMKQuest" <${process.env.GMAIL_USER}>`,
    to:      toEmail,
    subject: `${isDanger ? "⚠ Budget Exceeded" : `${pct}% of Budget Used"}`} — MMKQuest Alert`,
    html,
  });
}

// ─── TRANSACTION ALERT EMAIL ──────────────────────────────────────────────────
export async function sendTransactionEmail(
  toEmail: string,
  name: string,
  txName: string,
  amount: number,
  wallet: string,
  category: string
) {
  const isExpense = amount < 0;
  const color = isExpense ? "#ef4444" : "#22c55e";

  await transporter.sendMail({
    from:    `"MMKQuest" <${process.env.GMAIL_USER}>`,
    to:      toEmail,
    subject: `${isExpense ? "Expense" : "Income"} Detected: ${Math.abs(amount).toLocaleString()} MMK — MMKQuest`,
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0a0a0c;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0c;padding:40px 20px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#161619;border:1px solid #242428;border-radius:14px;overflow:hidden;max-width:480px;width:100%;">
        <tr><td style="background:#111114;padding:20px 32px;border-bottom:1px solid #242428;">
          <span style="font-family:'Courier New',monospace;font-size:18px;font-weight:700;color:#f0f0f5;">MMK<span style="color:#22c55e;">Quest</span></span>
        </td></tr>
        <tr><td style="padding:28px 32px;">
          <p style="font-size:14px;color:#8888a0;margin:0 0 20px;">Hi <strong style="color:#f0f0f5;">${name}</strong>,</p>
          <div style="background:#111114;border:1px solid ${color}30;border-radius:10px;padding:20px;text-align:center;margin-bottom:20px;">
            <p style="font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#444456;margin:0 0 8px;">${isExpense ? "Expense Detected" : "Income Received"}</p>
            <div style="font-family:'Courier New',monospace;font-size:32px;font-weight:700;color:${color};margin:0 0 4px;">${isExpense ? "-" : "+"}${Math.abs(amount).toLocaleString()} MMK</div>
            <p style="font-size:13px;color:#f0f0f5;margin:0;">${txName}</p>
            <p style="font-size:11px;color:#444456;margin:6px 0 0;text-transform:capitalize;">${category} · ${wallet}</p>
          </div>
          <p style="font-size:12px;color:#444456;margin:0;line-height:1.6;">This transaction has been automatically logged to your MMKQuest dashboard.</p>
        </td></tr>
        <tr><td style="background:#111114;padding:16px 32px;border-top:1px solid #242428;">
          <p style="font-size:10px;color:#444456;margin:0;text-align:center;">MMKQuest · Manage notifications in Profile → Notifications</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
}
