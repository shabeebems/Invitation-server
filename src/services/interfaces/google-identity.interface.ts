export type GoogleIdentity = {
  providerAccountId: string;
  email: string;
  emailVerified: boolean;
  name: string;
};

export default interface IGoogleIdentityProvider {
  verify(credential: string): Promise<GoogleIdentity>;
}
