import { AccessToken, Claims, LoginForm, RefreshAccessTokenParams, Token } from "./bindings";
import { apiPath, withAuthHeaders, withDefaultHeaders } from "./common";
import {
  ForbiddenError,
  InternalError,
  newErrorResponseMessage,
  UnauthorizedError,
  UserNotFoundError,
  ValidationError,
} from "./errors";

import { z } from "zod";

// https://a-novel.github.io/authentication/#tag/session

const SESSION_PATH = "/session";

/**
 * Takes an empty request with authorization headers, and check the validity of those headers. If the headers can be
 * used to access any protected resource, the session is considered valid and the decoded claims are returned as a
 * success response. Otherwise, an error will be sent, explaining why the session is invalid.
 */
export const checkSession = async (token: z.infer<typeof Token>): Promise<z.infer<typeof Claims>> => {
  const response = await fetch(apiPath(SESSION_PATH), withAuthHeaders(token));

  switch (response.status) {
    case 401:
      throw new UnauthorizedError("invalid session");
    default:
      if (!response.ok) throw new InternalError(await newErrorResponseMessage("check session", response));
      return Claims.parseAsync(await response.json());
  }
};

/**
 * Create a new session, using a set of credentials. The provided credentials will be used to validate the identity of
 * the caller. Once the credentials have been verified, a token is issued. The access rights it grants may depend on
 * the profile of the user.
 */
export const createSession = async (form: z.infer<typeof LoginForm>): Promise<z.infer<typeof AccessToken>> => {
  const response = await fetch(
    apiPath(SESSION_PATH),
    withDefaultHeaders({
      method: "PUT",
      body: JSON.stringify(form),
    })
  );

  switch (response.status) {
    case 403:
      throw new ForbiddenError("invalid credentials");
    case 404:
      throw new UserNotFoundError("user not found");
    default:
      if (!response.ok) throw new InternalError(await newErrorResponseMessage("create session", response));
      return AccessToken.parseAsync(await response.json());
  }
};

/**
 * Create a new anonymous session. An anonymous session is delivered without constraint, and grants basic access to
 * apis with low protection.
 */
export const createAnonymousSession = async (): Promise<z.infer<typeof AccessToken>> => {
  const response = await fetch(
    apiPath(SESSION_PATH + "/anon"),
    withDefaultHeaders({
      method: "PUT",
    })
  );

  if (!response.ok) throw new InternalError(await newErrorResponseMessage("create anon session", response));
  return AccessToken.parseAsync(await response.json());
};

/**
 * Takes a refresh token, and use it to issue a new access token.
 */
export const refreshSession = async (
  params: z.infer<typeof RefreshAccessTokenParams>
): Promise<z.infer<typeof AccessToken>> => {
  const searchParams = new URLSearchParams({
    accessToken: params.accessToken,
    refreshToken: params.refreshToken,
  });

  const response = await fetch(
    apiPath(SESSION_PATH + "/refresh", searchParams),
    withDefaultHeaders({
      method: "PATCH",
    })
  );

  switch (response.status) {
    case 401:
      throw new UnauthorizedError("invalid credentials");
    case 403:
      throw new ForbiddenError("permission denied");
    case 422:
      throw new ValidationError(await newErrorResponseMessage("refresh session", response));
    default:
      if (!response.ok) throw new InternalError(await newErrorResponseMessage("refresh session", response));
      return AccessToken.parseAsync(await response.json());
  }
};

/**
 * Issue a new refresh token. The access token used for this request must not be anonymous, and must come from direct
 * login (not a refresh token).
 */
export const newRefreshToken = async (token: z.infer<typeof Token>): Promise<z.infer<typeof Token>> => {
  const response = await fetch(
    apiPath(SESSION_PATH + "/refresh"),
    withAuthHeaders(token, {
      method: "PUT",
    })
  );

  const refreshToken = z.object({
    refreshToken: Token,
  });

  switch (response.status) {
    case 401:
      throw new UnauthorizedError("invalid credentials");
    case 403:
      throw new ForbiddenError("permission denied");
    default:
      if (!response.ok) throw new InternalError(await newErrorResponseMessage("refresh refresh token", response));
      return refreshToken.parseAsync(await response.json()).then((data) => data.refreshToken);
  }
};
