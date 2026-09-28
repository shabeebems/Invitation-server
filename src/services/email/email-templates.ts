export type EmailContent = {
  subject: string;
  text: string;
  html: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function layout(input: {
  preheader: string;
  title: string;
  paragraphs: string[];
  action?: { href: string; label: string };
}): string {
  const action = input.action
    ? `<tr>
        <td align="center" style="padding:8px 0 20px;">
          <a href="${escapeHtml(input.action.href)}" style="display:inline-block;background:#e51d7a;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;line-height:1;text-decoration:none;padding:14px 28px;border-radius:999px;">${escapeHtml(input.action.label)}</a>
        </td>
      </tr>
      <tr>
        <td style="padding:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:#6b6270;">
          Or copy this link into your browser:<br />
          <a href="${escapeHtml(input.action.href)}" style="color:#e51d7a;word-break:break-all;">${escapeHtml(input.action.href)}</a>
        </td>
      </tr>`
    : "";

  const paragraphs = input.paragraphs
    .map(
      (paragraph) =>
        `<tr><td style="padding:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#1f1a21;">${paragraph}</td></tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(input.title)}</title>
  </head>
  <body style="margin:0;padding:0;background:#fbf7fa;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(input.preheader)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fbf7fa;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:28px;padding:40px 36px;">
            <tr>
              <td style="padding:0 0 24px;font-family:Arial,Helvetica,sans-serif;font-size:28px;font-weight:800;letter-spacing:-0.03em;color:#ff4f9a;">Inviteo</td>
            </tr>
            <tr>
              <td style="padding:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:26px;line-height:1.3;font-weight:800;color:#1f1a21;">${escapeHtml(input.title)}</td>
            </tr>
            ${paragraphs}
            ${action}
            <tr>
              <td style="padding:24px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#8a8090;">Inviteo digital invitations</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function verificationEmail(verifyUrl: string): EmailContent {
  return {
    subject: "Verify your Inviteo email",
    text: `Verify your email within 1 hour: ${verifyUrl}`,
    html: layout({
      preheader: "Your verification link expires in 1 hour.",
      title: "Confirm your email",
      paragraphs: ["Use the button below to verify your Inviteo account. This link expires in 1 hour."],
      action: { href: verifyUrl, label: "Verify email" },
    }),
  };
}

export function welcomeEmail(name: string, homeUrl: string): EmailContent {
  const safeName = escapeHtml(name.trim() || "there");

  return {
    subject: "Welcome to Inviteo",
    text: `Welcome ${name.trim() || "there"}. Your Google account is ready. Open Inviteo: ${homeUrl}`,
    html: layout({
      preheader: "Your Inviteo account is ready.",
      title: "Welcome to Inviteo",
      paragraphs: [
        `Hi ${safeName}, your Google account is ready.`,
        "You can open Inviteo and start an invitation whenever you like.",
      ],
      action: { href: homeUrl, label: "Open Inviteo" },
    }),
  };
}

export function passwordResetEmail(resetUrl: string): EmailContent {
  return {
    subject: "Reset your Inviteo password",
    text: `Reset your password: ${resetUrl}`,
    html: layout({
      preheader: "Your password reset link expires in 1 hour.",
      title: "Reset your password",
      paragraphs: ["Use the button below to choose a new password. This link expires in 1 hour."],
      action: { href: resetUrl, label: "Reset password" },
    }),
  };
}
