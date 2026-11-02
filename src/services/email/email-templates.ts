export type EmailContent = {
  subject: string;
  text: string;
  html: string;
};

const BRAND_NAME = "Save the Kath";

const COLORS = {
  page: "#F4EEE1",
  card: "#FFFDF8",
  line: "#E6DBC6",
  softLine: "#EFE6D3",
  panel: "#FAF5EA",
  ink: "#173A2C",
  text: "#4A4F48",
  muted: "#8A8C83",
  gold: "#A8844F",
  wine: "#7A2636",
  buttonText: "#FBF6EA",
};

const SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const SERIF = "Georgia,'Times New Roman',Times,serif";

function origin() {
  return (process.env.CLIENT_ORIGIN || "http://localhost:3000").replace(/\/+$/, "");
}

export function supportEmail() {
  return process.env.SUPPORT_EMAIL?.trim() || "support@savethekath.com";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || "there";
}

/** Escaped text with **bold** and [label](https://url) spans, for copy that mixes fixed wording and user data. */
type Rich = string;

const LINK = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;

function rich(value: Rich) {
  return escapeHtml(value)
    .replace(LINK, `<a href="$2" target="_blank" style="color:${COLORS.wine};font-weight:600;text-decoration:underline;">$1</a>`)
    .replace(/\*\*(.+?)\*\*/g, `<strong style="color:${COLORS.ink};font-weight:600;">$1</strong>`);
}

function plain(value: Rich) {
  return value.replace(LINK, "$1 ($2)").replace(/\*\*(.+?)\*\*/g, "$1");
}

type Detail = { label: string; value: string; href?: string };
type Step = { title: string; body: string };

type LayoutInput = {
  subject: string;
  preheader: string;
  eyebrow: string;
  title: string;
  intro: Rich[];
  steps?: Step[];
  action?: { href: string; label: string };
  /** "end" puts the button after the outro, for emails where it is a fallback rather than the main step. */
  actionPlacement?: "start" | "end";
  secondary?: { href: string; label: string };
  details?: Detail[];
  outro?: Rich[];
  linkFallback?: boolean;
  note?: Rich;
  reason: string;
};

function paragraph(value: Rich, last = false) {
  return `<p style="margin:0 0 ${last ? 0 : 16}px;font-family:${SANS};font-size:16px;line-height:1.65;color:${COLORS.text};">${rich(value)}</p>`;
}

function button(action: { href: string; label: string }) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 0;">
  <tr>
    <td align="center" bgcolor="${COLORS.ink}" style="border-radius:999px;background:${COLORS.ink};">
      <a href="${escapeHtml(action.href)}" target="_blank" style="display:inline-block;padding:15px 32px;font-family:${SANS};font-size:15px;font-weight:600;line-height:1;color:${COLORS.buttonText};text-decoration:none;border-radius:999px;">${escapeHtml(action.label)}</a>
    </td>
  </tr>
</table>`;
}

function stepsBlock(steps: Step[]) {
  const rows = steps
    .map(
      (step, index) => `<tr>
    <td valign="top" style="padding:0 14px 18px 0;width:30px;">
      <div style="width:28px;height:28px;border-radius:999px;background:${COLORS.panel};border:1px solid ${COLORS.line};font-family:${SERIF};font-size:15px;line-height:28px;text-align:center;color:${COLORS.gold};">${index + 1}</div>
    </td>
    <td valign="top" style="padding:3px 0 18px;font-family:${SANS};font-size:15px;line-height:1.55;color:${COLORS.text};">
      <strong style="color:${COLORS.ink};font-weight:600;">${escapeHtml(step.title)}</strong><br />${escapeHtml(step.body)}
    </td>
  </tr>`
    )
    .join("");

  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:8px 0 0;">${rows}</table>`;
}

function detailsBlock(details: Detail[]) {
  const rows = details
    .map((detail, index) => {
      const value = detail.href
        ? `<a href="${escapeHtml(detail.href)}" target="_blank" style="color:${COLORS.wine};text-decoration:underline;word-break:break-all;">${escapeHtml(detail.value)}</a>`
        : escapeHtml(detail.value);
      const border = index === details.length - 1 ? "" : `border-bottom:1px solid ${COLORS.softLine};`;

      return `<tr>
    <td valign="top" style="padding:12px 12px 12px 0;${border}font-family:${SANS};font-size:13px;line-height:1.5;color:${COLORS.muted};white-space:nowrap;">${escapeHtml(detail.label)}</td>
    <td valign="top" align="right" style="padding:12px 0;${border}font-family:${SANS};font-size:14px;line-height:1.5;font-weight:600;color:${COLORS.ink};">${value}</td>
  </tr>`;
    })
    .join("");

  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:28px 0 0;background:${COLORS.panel};border:1px solid ${COLORS.softLine};border-radius:12px;">
  <tr><td style="padding:6px 20px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">${rows}</table>
  </td></tr>
</table>`;
}

function renderHtml(input: LayoutInput) {
  const home = origin();
  const support = supportEmail();
  const hiddenPadding = "&#8199;&#65279;&#847;".repeat(60);
  const actionAtEnd = input.actionPlacement === "end";

  const intro = input.intro.map((value, index) => paragraph(value, index === input.intro.length - 1 && !input.steps)).join("");
  const outro = (input.outro || []).map((value, index, all) => paragraph(value, index === all.length - 1)).join("");

  const secondary = input.secondary
    ? `<p style="margin:16px 0 0;font-family:${SANS};font-size:14px;line-height:1.5;">
      <a href="${escapeHtml(input.secondary.href)}" target="_blank" style="color:${COLORS.wine};font-weight:600;text-decoration:underline;">${escapeHtml(input.secondary.label)}</a>
    </p>`
    : "";

  const fallback =
    input.action && input.linkFallback
      ? `<p style="margin:24px 0 0;font-family:${SANS};font-size:13px;line-height:1.6;color:${COLORS.muted};">Button not working? Copy and paste this link into your browser:<br /><a href="${escapeHtml(input.action.href)}" target="_blank" style="color:${COLORS.wine};word-break:break-all;">${escapeHtml(input.action.href)}</a></p>`
      : "";

  const note = input.note
    ? `<p style="margin:28px 0 0;padding:20px 0 0;border-top:1px solid ${COLORS.softLine};font-family:${SANS};font-size:13px;line-height:1.6;color:${COLORS.muted};">${rich(input.note)}</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>${escapeHtml(input.subject)}</title>
  <style>
    @media only screen and (max-width: 600px) {
      .stk-card { padding: 32px 22px !important; }
      .stk-title { font-size: 26px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:${COLORS.page};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <div style="display:none;max-height:0;max-width:0;overflow:hidden;opacity:0;mso-hide:all;">${escapeHtml(input.preheader)}${hiddenPadding}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${COLORS.page}" style="background:${COLORS.page};">
    <tr>
      <td align="center" style="padding:36px 16px 40px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">
          <tr>
            <td align="center" style="padding:0 0 24px;">
              <a href="${escapeHtml(home)}" target="_blank" style="text-decoration:none;">
                <img src="${escapeHtml(`${home}/brand/save-the-kath-mark.png`)}" width="46" height="32" alt="" style="display:block;margin:0 auto 10px;border:0;width:46px;height:32px;" />
                <span style="font-family:${SERIF};font-size:24px;font-weight:700;letter-spacing:0.01em;color:${COLORS.ink};">Save <span style="font-size:20px;font-weight:400;font-style:italic;color:${COLORS.gold};">the</span> Kath</span>
              </a>
            </td>
          </tr>
          <tr>
            <td class="stk-card" bgcolor="${COLORS.card}" style="background:${COLORS.card};border:1px solid ${COLORS.line};border-radius:16px;padding:44px 44px 40px;">
              <p style="margin:0 0 14px;font-family:${SANS};font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:${COLORS.gold};">${escapeHtml(input.eyebrow)}</p>
              <h1 class="stk-title" style="margin:0 0 20px;font-family:${SERIF};font-size:30px;font-weight:400;line-height:1.2;color:${COLORS.ink};">${escapeHtml(input.title)}</h1>
              ${intro}
              ${input.steps ? stepsBlock(input.steps) : ""}
              ${input.action && !actionAtEnd ? button(input.action) : ""}
              ${secondary}
              ${input.details ? detailsBlock(input.details) : ""}
              ${outro ? `<div style="margin:28px 0 0;">${outro}</div>` : ""}
              ${input.action && actionAtEnd ? button(input.action) : ""}
              ${fallback}
              ${note}
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:28px 12px 0;font-family:${SANS};font-size:12px;line-height:1.7;color:${COLORS.muted};">
              Questions? Reply to this email or write to <a href="mailto:${escapeHtml(support)}" style="color:${COLORS.muted};text-decoration:underline;">${escapeHtml(support)}</a>.<br />
              <a href="${escapeHtml(`${home}/privacy`)}" target="_blank" style="color:${COLORS.muted};text-decoration:underline;">Privacy</a>
              &nbsp;·&nbsp;
              <a href="${escapeHtml(`${home}/terms`)}" target="_blank" style="color:${COLORS.muted};text-decoration:underline;">Terms</a>
              &nbsp;·&nbsp;
              <a href="${escapeHtml(`${home}/refund`)}" target="_blank" style="color:${COLORS.muted};text-decoration:underline;">Refunds</a>
              <br /><br />
              ${escapeHtml(input.reason)}<br />
              ${BRAND_NAME} · Digital invitations for weddings, housewarmings and celebrations
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function renderText(input: LayoutInput) {
  const lines: string[] = [input.title, "", input.intro.map(plain).join("\n\n")];

  if (input.steps) {
    lines.push("", ...input.steps.map((step, index) => `${index + 1}. ${step.title}: ${step.body}`));
  }

  const actionLine = input.action ? `${input.action.label}: ${input.action.href}` : "";

  if (actionLine && input.actionPlacement !== "end") {
    lines.push("", actionLine);
  }

  if (input.secondary) {
    lines.push(`${input.secondary.label}: ${input.secondary.href}`);
  }

  if (input.details) {
    lines.push("", ...input.details.map((detail) => `${detail.label}: ${detail.href || detail.value}`));
  }

  if (input.outro?.length) {
    lines.push("", input.outro.map(plain).join("\n\n"));
  }

  if (actionLine && input.actionPlacement === "end") {
    lines.push("", actionLine);
  }

  if (input.note) {
    lines.push("", plain(input.note));
  }

  lines.push(
    "",
    "--",
    `${BRAND_NAME} · ${origin()}`,
    `Questions? Reply to this email or write to ${supportEmail()}.`,
    input.reason
  );

  return lines.join("\n");
}

function render(input: LayoutInput): EmailContent {
  return { subject: input.subject, text: renderText(input), html: renderHtml(input) };
}

const ACCOUNT_REASON = `You're receiving this email because of activity on your ${BRAND_NAME} account.`;

export function verificationEmail(input: { name: string; verifyUrl: string }): EmailContent {
  return render({
    subject: `Confirm your email for ${BRAND_NAME}`,
    preheader: "One click to confirm your email. The link expires in 1 hour.",
    eyebrow: "Confirm your email",
    title: `Welcome, ${firstName(input.name)}`,
    intro: [
      `Thanks for joining ${BRAND_NAME}. Please confirm this is your email address so you can edit and publish your invitations.`,
    ],
    action: { href: input.verifyUrl, label: "Confirm my email" },
    linkFallback: true,
    note: "This link expires in 1 hour. If you didn't create an account, you can safely ignore this email.",
    reason: `You're receiving this email because someone signed up at ${BRAND_NAME} with this address.`,
  });
}

export function welcomeEmail(input: { name: string }): EmailContent {
  return render({
    subject: `Welcome to ${BRAND_NAME}`,
    preheader: "Your account is ready. Here's how to make your first invitation.",
    eyebrow: "Welcome",
    title: `Welcome, ${firstName(input.name)}`,
    intro: ["Your account is ready. A beautiful invitation takes just a few minutes:"],
    steps: [
      { title: "Choose a template", body: "Browse designs for weddings, housewarmings and more." },
      { title: "Add your details", body: "Names, dates, venue and photos, with a live preview as you type." },
      { title: "Publish and share", body: "Get one link for all your guests, ready to send on WhatsApp." },
    ],
    action: { href: `${origin()}/#templates`, label: "Browse templates" },
    outro: ["Need a hand with anything? Just reply to this email and we'll help."],
    reason: ACCOUNT_REASON,
  });
}

export function passwordResetEmail(input: { name: string; resetUrl: string }): EmailContent {
  return render({
    subject: `Reset your ${BRAND_NAME} password`,
    preheader: "Use this link to choose a new password. It expires in 1 hour.",
    eyebrow: "Password reset",
    title: "Reset your password",
    intro: [
      `Hi ${firstName(input.name)}, we received a request to reset the password for your ${BRAND_NAME} account. Use the button below to choose a new one.`,
    ],
    action: { href: input.resetUrl, label: "Choose a new password" },
    linkFallback: true,
    note: "This link expires in 1 hour and works only once. If you didn't ask for a reset, ignore this email and your password will stay the same.",
    reason: ACCOUNT_REASON,
  });
}

export function passwordChangedEmail(input: {
  name: string;
  email: string;
  added: boolean;
  when: string;
  device?: string;
  signedOutElsewhere: boolean;
}): EmailContent {
  const details: Detail[] = [
    { label: "Account", value: input.email },
    { label: "When", value: input.when },
  ];

  if (input.device) {
    details.push({ label: "Device", value: input.device });
  }

  const intro: Rich[] = input.added
    ? [`Hi ${firstName(input.name)}, a password was just added to your ${BRAND_NAME} account. You can now log in with your email and password as well as with Google.`]
    : [`Hi ${firstName(input.name)}, the password for your ${BRAND_NAME} account was just changed.`];

  intro.push(
    input.signedOutElsewhere
      ? "If this was you, there's nothing else to do. For your security, we've signed you out on your other devices."
      : "If this was you, there's nothing else to do."
  );

  return render({
    subject: input.added ? `A password was added to your ${BRAND_NAME} account` : `Your ${BRAND_NAME} password was changed`,
    preheader: "If this was you, there's nothing else to do.",
    eyebrow: "Security alert",
    title: input.added ? "Password added" : "Your password was changed",
    intro,
    details,
    outro: ["**Wasn't you?** Reset your password straight away and reply to this email so we can secure your account."],
    action: { href: `${origin()}/forgot-password`, label: "Reset my password" },
    actionPlacement: "end",
    reason: ACCOUNT_REASON,
  });
}

export function invitationPublishedEmail(input: {
  name: string;
  title: string;
  liveUrl: string;
  shareUrl: string;
  amount?: string;
  paymentId?: string;
  paidOn?: string;
}): EmailContent {
  const details: Detail[] = [
    { label: "Invitation", value: input.title },
    { label: "Guest link", value: input.liveUrl.replace(/^https?:\/\//, ""), href: input.liveUrl },
  ];

  if (input.amount) details.push({ label: "Amount paid", value: input.amount });
  if (input.paidOn) details.push({ label: "Paid on", value: input.paidOn });
  if (input.paymentId) details.push({ label: "Payment ID", value: input.paymentId });

  return render({
    subject: `Your invitation is live: ${input.title}`,
    preheader: "Your guest link is ready to share.",
    eyebrow: "Invitation published",
    title: "Your invitation is live",
    intro: [
      `Congratulations, ${firstName(input.name)}! **${input.title}** is now published and ready for your guests. Share the link below with everyone you're inviting.`,
    ],
    action: { href: input.liveUrl, label: "Open my invitation" },
    secondary: { href: input.shareUrl, label: "Share on WhatsApp" },
    details,
    outro: [
      `You can keep editing the text, photos and colours at any time from [My Invitations](${origin()}/user/invitations). Changes show up on the same link straight away.`,
    ],
    note: `Keep this email as your receipt. For any payment question or refund request, reply within 7 days of payment. See our [Refund Policy](${origin()}/refund) for details.`,
    reason: "You're receiving this email because you published an invitation on Save the Kath.",
  });
}
