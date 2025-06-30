import { getContextValue } from "../utils";
import { Token } from "./bindings";

import { z } from "zod";

/**
 * Returns a full url for the auth api.
 */
export const apiPath = (path: string, queryParams?: URLSearchParams): URL => {
  const url = new URL(getContextValue("baseURL") + path);

  if (queryParams) {
    url.search = queryParams.toString();
  }

  return url;
};

/**
 * Automatically set the default headers for the auth api.
 */
export const withDefaultHeaders = (init?: RequestInit): RequestInit => {
  return {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  };
};

/**
 * Automatically set the Authorization header with the given token.
 */
export const withAuthHeaders = (token: z.infer<typeof Token>, init?: RequestInit): RequestInit => {
  return withDefaultHeaders({
    ...init,
    headers: { Authorization: `Bearer ${token}`, ...init?.headers },
  });
};
