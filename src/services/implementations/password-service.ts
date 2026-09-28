import { injectable } from "inversify";
import bcrypt from "bcryptjs";
import IPasswordService from "../interfaces/password-service.interface";

const ROUNDS = 12;

@injectable()
export default class PasswordService implements IPasswordService {
  hash(password: string): Promise<string> {
    return bcrypt.hash(password, ROUNDS);
  }

  compare(password: string, passwordHash: string): Promise<boolean> {
    if (!passwordHash) {
      return Promise.resolve(false);
    }

    return bcrypt.compare(password, passwordHash);
  }
}
