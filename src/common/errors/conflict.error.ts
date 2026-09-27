import { BaseError } from "./base-error.error";

export class ConflictError extends BaseError {
  constructor(message: string, code = "CONFLICT") {
    super(message, 409, code);
  }
}
