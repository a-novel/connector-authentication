import { Token, ListUsersParams, User, GetUserParams } from "./bindings";
import { apiPath, withAuthHeaders } from "./common";
import { ForbiddenError, InternalError, newErrorResponseMessage, UnauthorizedError, UserNotFoundError } from "./errors";

import { z } from "zod";

// https://a-novel.github.io/authentication/#tag/users

const USERS_PATH = "/users";
const USER_PATH = "/user";

/**
 * List users in the database.
 */
export const listUsers = async (
  token: z.infer<typeof Token>,
  params: z.infer<typeof ListUsersParams>
): Promise<z.infer<typeof User>[]> => {
  const searchParams = new URLSearchParams();

  if (params.limit) searchParams.append("limit", params.limit.toString());
  if (params.offset) searchParams.append("offset", params.offset.toString());
  if (params.roles) params.roles.forEach((role) => searchParams.append("roles", role));

  const response = await fetch(apiPath(USERS_PATH, searchParams), withAuthHeaders(token));

  switch (response.status) {
    case 401:
      throw new UnauthorizedError("invalid credentials");
    case 403:
      throw new ForbiddenError("permission denied");
    default:
      if (!response.ok) throw new InternalError(await newErrorResponseMessage("list users", response));
      return User.array().parseAsync(await response.json());
  }
};

/**
 * Get a user from the database.
 */
export const getUser = async (
  token: z.infer<typeof Token>,
  params: z.infer<typeof GetUserParams>
): Promise<z.infer<typeof User>> => {
  const searchParams = new URLSearchParams();
  searchParams.set("userID", params.userID);

  const response = await fetch(apiPath(USER_PATH, searchParams), withAuthHeaders(token));

  switch (response.status) {
    case 401:
      throw new UnauthorizedError("invalid credentials");
    case 403:
      throw new ForbiddenError("permission denied");
    case 404:
      throw new UserNotFoundError("user not found");
    default:
      if (!response.ok) throw new InternalError(await newErrorResponseMessage("get user", response));
      return User.parse(await response.json());
  }
};
