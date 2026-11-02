/**
 * Renders every transactional email with sample data.
 *
 *   npm run emails:preview                     writes HTML + text files to email-previews/
 *   npm run emails:preview -- --send you@x.com also sends each one through the configured SMTP account
 *
 * On the server (no tsx): node dist/scripts/preview-emails.js --send you@x.com
 */
import "../config/load-env";
import fs from "fs";
import path from "path";
import {
  EmailContent,
  invitationPublishedEmail,
  passwordChangedEmail,
  passwordResetEmail,
  verificationEmail,
  welcomeEmail,
} from "../services/email/email-templates";
import SmtpEmailSender from "../services/implementations/smtp-email-sender";

const origin = (process.env.CLIENT_ORIGIN || "http://localhost:3000").replace(/\/+$/, "");
const sampleLink = `${origin}/verify-email?token=sample-token-for-preview-only`;
const liveUrl = `${origin}/rahul-and-priya`;

const samples: Record<string, EmailContent> = {
  "1-verification": verificationEmail({ name: "Priya Menon", verifyUrl: sampleLink }),
  "2-welcome": welcomeEmail({ name: "Priya Menon" }),
  "3-password-reset": passwordResetEmail({
    name: "Priya Menon",
    resetUrl: `${origin}/reset-password?token=sample-token-for-preview-only`,
  }),
  "4-password-changed": passwordChangedEmail({
    name: "Priya Menon",
    email: "priya@example.com",
    added: false,
    when: "3 Nov 2026, 9:41 pm IST",
    device: "Chrome on Android",
    signedOutElsewhere: true,
  }),
  "5-invitation-published": invitationPublishedEmail({
    name: "Priya Menon",
    title: "Rahul & Priya",
    liveUrl,
    shareUrl: `https://wa.me/?text=${encodeURIComponent(`You're invited! Rahul & Priya\n${liveUrl}`)}`,
    amount: "₹999",
    paidOn: "3 Nov 2026, 9:38 pm IST",
    paymentId: "pay_SampleId12345",
  }),
};

async function main() {
  const outDir = path.resolve(process.cwd(), "email-previews");
  fs.mkdirSync(outDir, { recursive: true });

  for (const [name, email] of Object.entries(samples)) {
    fs.writeFileSync(path.join(outDir, `${name}.html`), email.html);
    fs.writeFileSync(path.join(outDir, `${name}.txt`), `Subject: ${email.subject}\n\n${email.text}\n`);
  }
  console.log(`Wrote ${Object.keys(samples).length} previews to ${outDir}`);

  const sendIndex = process.argv.indexOf("--send");
  const to = sendIndex >= 0 ? process.argv[sendIndex + 1] : "";

  if (!to) {
    return;
  }

  const sender = new SmtpEmailSender();
  for (const [name, email] of Object.entries(samples)) {
    await sender.send({ to, ...email, subject: `[Preview] ${email.subject}` });
    console.log(`Sent ${name} to ${to}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
