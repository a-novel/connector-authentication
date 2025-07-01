import { z } from "zod";

// Mappings for the authentication API.
// https://a-novel.github.io/service-authentication/

export const BINDINGS_VALIDATION = {
  EMAIL: { MIN: 3, MAX: 128 },
  PASSWORD: { MIN: 2, MAX: 1024 },
  SHORT_CODE: { MIN: 1, MAX: 32 },
  PAGINATION: { MAX: 1000 },
};

// =====================================================================================================================
// DEFINITIONS
// =====================================================================================================================

export enum ClaimsRoleEnum {
  Anon = "auth:anon",
  User = "auth:user",
  Admin = "auth:admin",
  SuperAdmin = "auth:super_admin",
}

export enum CredentialsRoleEnum {
  User = "user",
  Admin = "admin",
  SuperAdmin = "super_admin",
}

export enum LangEnum {
  En = "en",
  Fr = "fr",
}

export const ClaimsRole = z.enum([
  ClaimsRoleEnum.Anon,
  ClaimsRoleEnum.User,
  ClaimsRoleEnum.Admin,
  ClaimsRoleEnum.SuperAdmin,
]);

/**
 * A role specifically assigned to a user.
 */
export const CredentialsRole = z.enum([
  CredentialsRoleEnum.User,
  CredentialsRoleEnum.Admin,
  CredentialsRoleEnum.SuperAdmin,
]);

export const Lang = z.enum([LangEnum.En, LangEnum.Fr]);

/**
 * The token used to authenticate the session. This token can be passed as a header to http requests on
 * protected routes.
 */
export const Token = z.string();

/**
 * The email of the user.
 */
export const Email = z.string().email().min(BINDINGS_VALIDATION.EMAIL.MIN).max(BINDINGS_VALIDATION.EMAIL.MAX);

/**
 * The password of the user.
 */
export const Password = z.string().min(BINDINGS_VALIDATION.PASSWORD.MIN).max(BINDINGS_VALIDATION.PASSWORD.MAX);

/**
 * A clear code sent to the user for one-time access on a specific action / resource. This code is URL safe.
 */
export const ShortCode = z.string().min(BINDINGS_VALIDATION.SHORT_CODE.MIN).max(BINDINGS_VALIDATION.SHORT_CODE.MAX);

/**
 * The unique identifier of the user.
 */
export const UserID = z.string().uuid();

export const User = z.object({
  id: UserID,
  email: Email,
  role: CredentialsRole,
  createdAt: z
    .string()
    .datetime()
    .transform((value) => new Date(value)),
  updatedAt: z
    .string()
    .datetime()
    .transform((value) => new Date(value)),
});

export const Claims = z.object({
  /**
   * The unique identifier of the user. Can be null if the session is anonymous.
   */
  userID: z.string().uuid().optional(),
  /**
   * The roles granted by the token.
   */
  roles: z.array(ClaimsRole),
  /**
   * The unique identifier of the refresh token. Can be null if the session is anonymous.
   */
  refreshTokenID: z.string().uuid().optional(),
});

export const TokenResponse = z.object({
  accessToken: Token,
  refreshToken: Token.optional(),
});

// =====================================================================================================================
// FORMS
// =====================================================================================================================

/**
 * Data used to authenticate a user. It usually includes some private information only known to the user (password,
 * secret question, etc.), that is checked against some protected data on the server. If this information is correct,
 * the user is authenticated and granted a special token.
 */
export const LoginForm = z.object({
  email: Email,
  password: Password,
});

/**
 * Create a new registration link.
 */
export const RequestRegistrationForm = z.object({
  email: Email,
  lang: Lang,
});

/**
 * Create a new email update link.
 */
export const RequestEmailUpdateForm = z.object({
  email: Email,
  lang: Lang,
});

/**
 * Create a new password update link.
 */
export const RequestPasswordResetForm = z.object({
  email: Email,
  lang: Lang,
});

/**
 * Data used to create a user.
 */
export const RegisterForm = z.object({
  email: Email,
  password: Password,
  shortCode: ShortCode,
});

/**
 * Data used to update the email of a user.
 */
export const UpdateEmailForm = z.object({
  userID: UserID,
  shortCode: ShortCode,
});

/**
 * Data used to update the password of a user.
 */
export const UpdatePasswordForm = z.object({
  password: Password,
  /**
   * The current password of the user, used for further verification of the caller identity.
   */
  currentPassword: Password,
});

/**
 * Data used to reset the password of a user.
 */
export const ResetPasswordForm = z.object({
  userID: UserID,
  password: Password,
  shortCode: ShortCode,
});

/**
 * Data used to update the role of a user. The user requesting the update must follow some specific rules.
 *
 * A user cannot upgrade other users to a role higher than its own.
 * A user can only downgrade other users to a role lower than its own.
 * For example, the following operations are permitted:
 *
 *  - ✅ A (super_admin) upgrades B (admin) to super_admin.
 *  - ✅ A (admin) upgrades B (user) to admin.
 *  - ✅ A (super_admin) downgrades B (admin) to user.
 *
 * But the following operations are not:
 *
 *  - ❌ A (admin) upgrades B (user) to super_admin.
 *  - ❌ A (admin) downgrades B (admin) to user.
 */
export const UpdateRoleForm = z.object({
  userID: UserID,
  role: CredentialsRole,
});

// =====================================================================================================================
// PARAMS
// =====================================================================================================================

export const RefreshAccessTokenParams = z.object({
  accessToken: Token,
  refreshToken: Token,
});

export const EmailExistsParams = z.object({
  email: Email,
});

export const ListUsersParams = z.object({
  limit: z.number().max(BINDINGS_VALIDATION.PAGINATION.MAX).min(1).optional(),
  offset: z.number().min(0).optional(),
  roles: z.array(CredentialsRole).optional(),
});

export const GetUserParams = z.object({
  userID: UserID,
});
