import { BaseError } from "./base-error.error";

export class UnauthorizedError extends BaseError {
  constructor(message: string) {
    super(message, 401, "UNAUTHORIZED");
  }
}
