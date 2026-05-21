import nodemailer from "nodemailer";

function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST!,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
    },
  });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const from = process.env.SMTP_FROM ?? `"Plug n' Play Arena" <${process.env.SMTP_USER}>`;
  const transporter = createTransport();

  await transporter.sendMail({
    from,
    to,
    subject: "Reset your Plug n' Play Arena password",
    text: `You requested a password reset. Use the link below (valid for 1 hour):\n\n${resetUrl}\n\nIf you didn't request this, ignore this email.`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#080810;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#080810;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#0f0f1a;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;max-width:560px;width:100%;">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#e84142,#7c3aed);padding:32px 40px;text-align:center;">
            <span style="font-size:36px;">⚡</span>
            <h1 style="color:#fff;margin:12px 0 4px;font-size:22px;font-weight:800;letter-spacing:-0.5px;">Plug n' Play Arena</h1>
            <p style="color:rgba(255,255,255,0.7);margin:0;font-size:12px;text-transform:uppercase;letter-spacing:2px;">Web3 Learning Platform</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <h2 style="color:#fff;font-size:20px;font-weight:700;margin:0 0 12px;">Password Reset Request</h2>
            <p style="color:rgba(255,255,255,0.55);font-size:14px;line-height:1.6;margin:0 0 28px;">
              We received a request to reset your password. Click the button below to set a new one. This link expires in <strong style="color:#e2b44b;">1 hour</strong>.
            </p>
            <div style="text-align:center;margin:0 0 28px;">
              <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#e84142,#7c3aed);color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 36px;border-radius:12px;letter-spacing:0.2px;">
                Reset My Password
              </a>
            </div>
            <p style="color:rgba(255,255,255,0.3);font-size:12px;line-height:1.6;margin:0 0 8px;">
              Or copy this link into your browser:
            </p>
            <p style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:10px 14px;font-family:monospace;font-size:11px;color:rgba(255,255,255,0.4);word-break:break-all;margin:0 0 28px;">
              ${resetUrl}
            </p>
            <hr style="border:none;border-top:1px solid rgba(255,255,255,0.06);margin:0 0 24px;">
            <p style="color:rgba(255,255,255,0.25);font-size:12px;line-height:1.6;margin:0;">
              If you didn't request a password reset, you can safely ignore this email. Your password won't change.
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
            <p style="color:rgba(255,255,255,0.2);font-size:11px;margin:0;">
              Powered by Avalanche &bull; Learn &bull; Build &bull; Earn
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
}
