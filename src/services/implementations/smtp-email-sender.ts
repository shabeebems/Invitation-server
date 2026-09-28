import { injectable } from "inversify";
import nodemailer, { Transporter } from "nodemailer";
import { InternalServerError } from "../../common/errors";
import { readSmtpMailConfig } from "../../config/smtp-mail";
import IEmailSender, { OutboundEmail } from "../interfaces/email-sender.interface";

@injectable()
export default class SmtpEmailSender implements IEmailSender {
  private transport: Transporter | null = null;
  private from = "";

  async send(message: OutboundEmail): Promise<void> {
    const transport = this.transporter();
    const link = message.text.match(/https?:\/\/\S+/)?.[0];

    if (link && process.env.NODE_ENV !== "production") {
      console.info("email.link", { to: message.to, subject: message.subject, link });
    }

    try {
      await transport.sendMail({
        from: this.from,
        to: message.to,
        subject: message.subject,
        text: message.text,
        html: message.html,
      });
    } catch (error) {
      const detail = error instanceof Error ? error.message : "unknown error";
      console.error("email.send.failed", detail);
      throw new InternalServerError("Could not send email");
    }
  }

  private transporter(): Transporter {
    if (this.transport) {
      return this.transport;
    }

    const config = readSmtpMailConfig();

    if (!config) {
      throw new InternalServerError("Email is not configured. Set SMTP_USER and SMTP_PASS, then restart the server.");
    }

    this.from = config.from;
    this.transport = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });

    return this.transport;
  }
}
