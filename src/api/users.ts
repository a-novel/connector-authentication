import { Token, ListUsersParams, User } from "./bindings";
import { authPath, withAuthHeaders } from "./common";
import { InternalError, newErrorResponseMessage, UnauthorizedError } from "./errors";

import { z } from "zod";

// https://a-novel.github.io/authentication/#tag/users

const USERS_PATH = "/users";

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

  const response = await fetch(authPath(USERS_PATH, searchParams), withAuthHeaders(token));

  switch (response.status) {
    case 401:
      throw new UnauthorizedError("invalid credentials");
    default:
      if (!response.ok) throw new InternalError(await newErrorResponseMessage("list users", response));
      return User.array().parseAsync(await response.json());
  }
};
