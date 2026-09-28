import { injectable } from "inversify";
import { OAuth2Client } from "google-auth-library";
import { BadRequestError, UnauthorizedError } from "../../common/errors";
import IGoogleIdentityProvider, { GoogleIdentity } from "../interfaces/google-identity.interface";

@injectable()
export default class GoogleIdentityProvider implements IGoogleIdentityProvider {
  async verify(credential: string): Promise<GoogleIdentity> {
    const clientId = process.env.GOOGLE_CLIENT_ID;

    if (!clientId) {
      throw new BadRequestError("Google sign-in is not configured");
    }

    const client = new OAuth2Client(clientId);

    try {
      const ticket = await client.verifyIdToken({ idToken: credential, audience: clientId });
      const payload = ticket.getPayload();

      if (!payload?.sub || !payload.email) {
        throw new UnauthorizedError("Google sign-in could not be verified");
      }

      return {
        providerAccountId: payload.sub,
        email: payload.email.toLowerCase(),
        emailVerified: Boolean(payload.email_verified),
        name: payload.name || payload.email,
      };
    } catch (error) {
      if (error instanceof UnauthorizedError || error instanceof BadRequestError) {
        throw error;
      }

      throw new UnauthorizedError("Google sign-in could not be verified");
    }
  }
}
