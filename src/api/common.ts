import { Token } from "./bindings";

import { z } from "zod";

const params = {
  baseURL: "",
};

/**
 * Returns a full url for the auth api.
 */
export const apiPath = (path: string, queryParams?: URLSearchParams): URL => {
  if (!params.baseURL) {
    throw new Error("authentication API base URL is not set. Call init() before using this function.");
  }

  const url = new URL(params.baseURL + path);

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

export const initBaseURL = (url: string) => {
  params.baseURL = url;
};

export { params };
