import { BaseError } from "./base-error.error";

export class BadRequestError extends BaseError {
  constructor(message: string) {
    super(message, 400, "BAD_REQUEST");
  }
}
