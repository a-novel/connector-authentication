import { Token } from "./bindings";

import { z } from "zod";

if (!import.meta.env.VITE_AUTH_API) {
  throw new Error("VITE_AUTH_API is not defined");
}

/**
 * AuthPath returns a full url for the auth api.
 */
export const authPath = (path: string, queryParams?: URLSearchParams): URL => {
  const url = new URL(import.meta.env.VITE_AUTH_API + path);

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
