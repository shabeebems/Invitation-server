export class BaseError extends Error {
  public statusCode: number;
  public code?: string;

  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.name = new.target.name;
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace(this, new.target);
  }
}
