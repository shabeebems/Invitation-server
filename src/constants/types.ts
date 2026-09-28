const TYPES = {
  ICategoryRepository: Symbol.for("ICategoryRepository"),
  ICategoryService: Symbol.for("ICategoryService"),
  ICategoryController: Symbol.for("ICategoryController"),

  ITemplateRepository: Symbol.for("ITemplateRepository"),
  ITemplateService: Symbol.for("ITemplateService"),
  ITemplateController: Symbol.for("ITemplateController"),

  IThemeRepository: Symbol.for("IThemeRepository"),
  IThemeService: Symbol.for("IThemeService"),
  IThemeController: Symbol.for("IThemeController"),

  IWorkRepository: Symbol.for("IWorkRepository"),
  IWorkService: Symbol.for("IWorkService"),
  IWorkController: Symbol.for("IWorkController"),

  IUserRepository: Symbol.for("IUserRepository"),
  IRefreshTokenRepository: Symbol.for("IRefreshTokenRepository"),
  IPasswordService: Symbol.for("IPasswordService"),
  ITokenService: Symbol.for("ITokenService"),
  IAuthService: Symbol.for("IAuthService"),
  IAuthController: Symbol.for("IAuthController"),
  ISessionService: Symbol.for("ISessionService"),
  IEmailSender: Symbol.for("IEmailSender"),
  IEmailVerificationService: Symbol.for("IEmailVerificationService"),
  IPasswordResetService: Symbol.for("IPasswordResetService"),
  IGoogleIdentityProvider: Symbol.for("IGoogleIdentityProvider"),
  IGoogleAuthService: Symbol.for("IGoogleAuthService"),
  IGoogleAuthController: Symbol.for("IGoogleAuthController"),
  IAccountSecurityController: Symbol.for("IAccountSecurityController"),
  ISessionController: Symbol.for("ISessionController"),
  IDashboardService: Symbol.for("IDashboardService"),
  IDashboardController: Symbol.for("IDashboardController"),
};

export default TYPES;
