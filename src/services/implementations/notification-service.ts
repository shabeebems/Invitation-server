import { inject, injectable } from "inversify";
import TYPES from "../../constants/types";
import IOrderRepository from "../../repositories/interfaces/order-repository.interface";
import IUserRepository from "../../repositories/interfaces/user-repository.interface";
import IWorkRepository from "../../repositories/interfaces/work-repository.interface";
import { invitationPublishedEmail, passwordChangedEmail, welcomeEmail } from "../email/email-templates";
import IEmailSender from "../interfaces/email-sender.interface";
import INotificationService, {
  NotificationRecipient,
  PasswordChange,
} from "../interfaces/notification-service.interface";

const IST = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: "Asia/Kolkata",
});

function formatIst(date: Date) {
  return `${IST.format(date)} IST`;
}

function formatAmount(paise: number, currency: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: paise % 100 === 0 ? 0 : 2,
  }).format(paise / 100);
}

function describeDevice(userAgent: string) {
  const browser = /Edg\//.test(userAgent)
    ? "Edge"
    : /OPR\//.test(userAgent)
      ? "Opera"
      : /Firefox\//.test(userAgent)
        ? "Firefox"
        : /Chrome\//.test(userAgent)
          ? "Chrome"
          : /Safari\//.test(userAgent)
            ? "Safari"
            : "";
  const os = /Android/.test(userAgent)
    ? "Android"
    : /iPhone/.test(userAgent)
      ? "iPhone"
      : /iPad/.test(userAgent)
        ? "iPad"
        : /Windows/.test(userAgent)
          ? "Windows"
          : /Mac OS X/.test(userAgent)
            ? "Mac"
            : /Linux/.test(userAgent)
              ? "Linux"
              : "";

  if (browser && os) return `${browser} on ${os}`;
  return browser || os || undefined;
}

function idOf(ref: unknown): string {
  if (ref && typeof ref === "object" && "_id" in ref) {
    return String((ref as { _id: unknown })._id);
  }
  return String(ref || "");
}

@injectable()
export default class NotificationService implements INotificationService {
  constructor(
    @inject(TYPES.IEmailSender) private readonly email: IEmailSender,
    @inject(TYPES.IUserRepository) private readonly users: IUserRepository,
    @inject(TYPES.IWorkRepository) private readonly works: IWorkRepository,
    @inject(TYPES.IOrderRepository) private readonly orders: IOrderRepository
  ) {}

  welcome(user: NotificationRecipient): Promise<void> {
    return this.attempt("welcome", () => this.email.send({ to: user.email, ...welcomeEmail({ name: user.name }) }));
  }

  passwordChanged(user: NotificationRecipient, change: PasswordChange): Promise<void> {
    return this.attempt("password-changed", () =>
      this.email.send({
        to: user.email,
        ...passwordChangedEmail({
          name: user.name,
          email: user.email,
          added: change.added,
          signedOutElsewhere: change.signedOutElsewhere,
          when: formatIst(new Date()),
          device: describeDevice(change.meta.userAgent),
        }),
      })
    );
  }

  invitationPublished(workId: string): Promise<void> {
    return this.attempt("invitation-published", async () => {
      if (!(await this.works.claimPublishedNotice(workId))) {
        return;
      }

      try {
        await this.sendPublished(workId);
      } catch (error) {
        await this.works.releasePublishedNotice(workId).catch(() => undefined);
        throw error;
      }
    });
  }

  private async sendPublished(workId: string) {
    const work = await this.works.findById(workId);
    const user = work?.userId ? await this.users.findById(idOf(work.userId)) : null;

    if (!work || !user) {
      return;
    }

    const order = work.orderId ? await this.orders.findById(idOf(work.orderId)) : null;
    const origin = (process.env.CLIENT_ORIGIN || "http://localhost:3000").replace(/\/+$/, "");
    const liveUrl = `${origin}/${work.slug}`;
    const content = work.content || {};
    const couple = [content.groomName, content.brideName].filter(Boolean).join(" & ");
    const title = String(content.hostNames || couple || work.name).trim();
    const custom = String(content.shareMessage || "").trim();
    const shareText = custom
      ? custom.includes(liveUrl)
        ? custom
        : `${custom}\n${liveUrl}`
      : `You're invited! ${title}\n${liveUrl}`;

    await this.email.send({
      to: user.email,
      ...invitationPublishedEmail({
        name: user.name,
        title,
        liveUrl,
        shareUrl: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
        amount: order?.status === "PAID" ? formatAmount(order.amount, order.currency) : undefined,
        paidOn: order?.paidAt ? formatIst(order.paidAt) : undefined,
        paymentId: order?.razorpayPaymentId || undefined,
      }),
    });
  }

  private async attempt(kind: string, task: () => Promise<void>) {
    try {
      await task();
    } catch (error) {
      console.error("email.notify.failed", kind, error instanceof Error ? error.message : error);
    }
  }
}
