import {
  AccessToken,
  Email,
  EmailExistsParams,
  RegisterForm,
  ResetPasswordForm,
  Token,
  UpdateEmailForm,
  UpdatePasswordForm,
  UpdateRoleForm,
  User,
} from "./bindings";
import { apiPath, withAuthHeaders } from "./common";
import {
  EmailTakenError,
  ForbiddenError,
  InternalError,
  newErrorResponseMessage,
  UnauthorizedError,
  UserNotFoundError,
  ValidationError,
} from "./errors";

import { z } from "zod";

// https://a-novel.github.io/authentication/#tag/credentials

const CREDENTIALS_PATH = "/credentials";

/**
 * Create a new user. The form must contain a short code, that was sent through a registration link at the user
 * desired email.
 *
 * On success, a valid access token is returned, that can be used to access higher-privilege routes.
 */
export const createUser = async (
  token: z.infer<typeof Token>,
  form: z.infer<typeof RegisterForm>
): Promise<z.infer<typeof AccessToken>> => {
  const response = await fetch(
    apiPath(CREDENTIALS_PATH),
    withAuthHeaders(token, {
      method: "PUT",
      body: JSON.stringify(form),
    })
  );

  switch (response.status) {
    case 401:
      throw new UnauthorizedError("invalid credentials");
    case 403:
      throw new ForbiddenError("permission denied");
    case 410:
      throw new EmailTakenError(`email ${form.email} is already taken`);
    default:
      if (!response.ok) throw new InternalError(await newErrorResponseMessage("create user", response));
      return AccessToken.parseAsync(await response.json());
  }
};

/**
 * Return whether the email is already taken or not.
 */
export const emailExists = async (
  token: z.infer<typeof Token>,
  params: z.infer<typeof EmailExistsParams>
): Promise<boolean> => {
  const searchParams = new URLSearchParams({
    email: params.email,
  });
  const response = await fetch(apiPath(CREDENTIALS_PATH + "/email", searchParams), withAuthHeaders(token));

  switch (response.status) {
    case 401:
      throw new UnauthorizedError("invalid credentials");
    case 403:
      throw new ForbiddenError("permission denied");
    case 404:
      return false;
    default:
      if (!response.ok) throw new InternalError(await newErrorResponseMessage("email exists", response));
      return true;
  }
};

/**
 * Update the email of a user. This route requires a valid short code, that was sent to the new email. If the short
 * code is valid, the email of the user is updated with the email address the short code was sent to.
 */
export const updateEmail = async (
  token: z.infer<typeof Token>,
  form: z.infer<typeof UpdateEmailForm>
): Promise<string> => {
  const response = await fetch(
    apiPath(CREDENTIALS_PATH + "/email"),
    withAuthHeaders(token, {
      method: "PATCH",
      body: JSON.stringify(form),
    })
  );

  const responseSchema = z.object({
    email: Email,
  });

  switch (response.status) {
    case 401:
      throw new UnauthorizedError("invalid credentials");
    case 403:
      throw new ForbiddenError("permission denied");
    case 404:
      throw new UserNotFoundError("user not found");
    case 410:
      throw new EmailTakenError(await newErrorResponseMessage("update email", response));
    default:
      if (!response.ok) throw new InternalError(await newErrorResponseMessage("update email", response));
      return responseSchema.parseAsync(await response.json()).then((data) => data.email);
  }
};

/**
 * Update the password of a user. This route requires the original password of the user, to double-check the identity
 * of the caller.
 */
export const updatePassword = async (
  token: z.infer<typeof Token>,
  form: z.infer<typeof UpdatePasswordForm>
): Promise<void> => {
  const response = await fetch(
    apiPath(CREDENTIALS_PATH + "/password"),
    withAuthHeaders(token, {
      method: "PATCH",
      body: JSON.stringify(form),
    })
  );

  switch (response.status) {
    case 401:
      throw new UnauthorizedError("invalid credentials");
    case 403:
      throw new ForbiddenError("permission denied");
    default:
      if (!response.ok) throw new InternalError(await newErrorResponseMessage("update password", response));
  }
};

/**
 * Update the role of a user. This route requires the original password of the user, to double-check the identity
 * of the caller.
 */
export const updateRole = async (
  token: z.infer<typeof Token>,
  form: z.infer<typeof UpdateRoleForm>
): Promise<z.infer<typeof User>> => {
  const response = await fetch(
    apiPath(CREDENTIALS_PATH + "/role"),
    withAuthHeaders(token, {
      method: "PATCH",
      body: JSON.stringify(form),
    })
  );

  switch (response.status) {
    case 401:
      throw new UnauthorizedError("invalid credentials");
    case 403:
      throw new ForbiddenError("permission denied");
    case 404:
      throw new UserNotFoundError("user not found");
    case 422:
      throw new ValidationError(await newErrorResponseMessage("update user", response));
    default:
      if (!response.ok) throw new InternalError(await newErrorResponseMessage("update role", response));
      return User.parseAsync(await response.json());
  }
};

/**
 * Reset the password of a user. This route allows an unauthenticated session to update the password of a user. To
 * prevent security issues, this route requires a short code that was sent to the email of the user that requested the
 * password reset.
 */
export const resetPassword = async (
  token: z.infer<typeof Token>,
  form: z.infer<typeof ResetPasswordForm>
): Promise<void> => {
  const response = await fetch(
    apiPath(CREDENTIALS_PATH + "/password/reset"),
    withAuthHeaders(token, {
      method: "PATCH",
      body: JSON.stringify(form),
    })
  );

  switch (response.status) {
    case 401:
      throw new UnauthorizedError("invalid credentials");
    case 403:
      throw new ForbiddenError("permission denied");
    default:
      if (!response.ok) throw new InternalError(await newErrorResponseMessage("reset password", response));
  }
};
