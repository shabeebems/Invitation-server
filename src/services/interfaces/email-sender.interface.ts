export type OutboundEmail = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

export default interface IEmailSender {
  send(message: OutboundEmail): Promise<void>;
}
