export type SmtpMailConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
};

export function readSmtpMailConfig(): SmtpMailConfig | null {
  const user = process.env.SMTP_USER?.trim() || "";
  const pass = process.env.SMTP_PASS?.trim() || "";

  if (!user || !pass) {
    return null;
  }

  const port = Number(process.env.SMTP_PORT || 587);

  return {
    host: process.env.SMTP_HOST?.trim() || "smtp.gmail.com",
    port,
    secure: port === 465,
    user,
    pass,
    from: process.env.MAIL_FROM?.trim() || user,
  };
}
