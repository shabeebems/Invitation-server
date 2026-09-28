import { BaseError } from "./base-error.error";

export class InternalServerError extends BaseError {
  constructor(message: string) {
    super(message, 500, "INTERNAL_SERVER_ERROR");
  }
}
