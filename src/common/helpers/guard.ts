import { BaseError, InternalServerError } from "../errors";

export async function guard<T>(fallback: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof BaseError) {
      throw error;
    }

    throw new InternalServerError(fallback);
  }
}
