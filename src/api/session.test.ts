import { server } from "../../__test__/utils/setup";
import {
  ClaimsRoleEnum,
  LoginForm,
  RefreshAccessTokenParams,
  isForbiddenError,
  isInternalError,
  isUnauthorizedError,
  isUserNotFoundError,
  isValidationError,
  checkSession,
  createAnonymousSession,
  createSession,
  refreshSession,
} from "./index";

import { http } from "@a-novel/nodelib/msw";

import { HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { z } from "zod";

describe("check session", () => {
  const testCases = {
    success: {
      response: HttpResponse.json({
        userID: "94b4d288-dbff-4eca-805a-f45311a34e15",
        roles: [ClaimsRoleEnum.User],
      }),
      expect: {
        userID: "94b4d288-dbff-4eca-805a-f45311a34e15",
        roles: [ClaimsRoleEnum.User],
      },
      expectError: null,
    },
    unauthorized: {
      response: HttpResponse.json(undefined, { status: 401 }),
      expect: null,
      expectError: isUnauthorizedError,
    },
    internal: {
      response: HttpResponse.json("crash", { status: 501 }),
      expect: null,
      expectError: isInternalError,
    },
  };

  for (const [key, { response, expect: expected, expectError }] of Object.entries(testCases)) {
    it(`returns ${key} response`, async () => {
      server.use(
        http
          .get("http://localhost:3000/session")
          .headers(new Headers({ Authorization: "Bearer access-token" }), HttpResponse.error())
          .resolve(() => response)
      );

      const apiRes = await checkSession("access-token").catch((e) => e);

      if (expected) {
        expect(apiRes).toEqual(expected);
      } else if (expectError) {
        expect(expectError(apiRes)).toBe(true);
      }
    });
  }
});

describe("create session", () => {
  const defaultForm: z.infer<typeof LoginForm> = {
    email: "user@email.com",
    password: "password",
  };

  const testCases = {
    success: {
      response: HttpResponse.json({
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
      }),
      expect: {
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
      },
      expectError: null,
    },
    forbidden: {
      response: HttpResponse.json(undefined, { status: 403 }),
      expect: null,
      expectError: isForbiddenError,
    },
    notFound: {
      response: HttpResponse.json(undefined, { status: 404 }),
      expect: null,
      expectError: isUserNotFoundError,
    },
    internal: {
      response: HttpResponse.json("crash", { status: 501 }),
      expect: null,
      expectError: isInternalError,
    },
  };

  for (const [key, { response, expect: expected, expectError }] of Object.entries(testCases)) {
    it(`returns ${key} response`, async () => {
      server.use(
        http
          .put("http://localhost:3000/session")
          .bodyJSON(defaultForm, HttpResponse.error())
          .resolve(() => response)
      );

      const apiRes = await createSession(defaultForm).catch((e) => e);

      if (expected) {
        expect(apiRes).toEqual(expected);
      } else if (expectError) {
        expect(expectError(apiRes)).toBe(true);
      }
    });
  }
});

describe("create anonymous session", () => {
  const testCases = {
    success: {
      response: HttpResponse.json({
        accessToken: "new-access-token",
      }),
      expect: {
        accessToken: "new-access-token",
      },
      expectError: null,
    },
    internal: {
      response: HttpResponse.json("crash", { status: 501 }),
      expect: null,
      expectError: isInternalError,
    },
  };

  for (const [key, { response, expect: expected, expectError }] of Object.entries(testCases)) {
    it(`returns ${key} response`, async () => {
      server.use(http.put("http://localhost:3000/session/anon").resolve(() => response));

      const apiRes = await createAnonymousSession().catch((e) => e);

      if (expected) {
        expect(apiRes).toEqual(expected);
      } else if (expectError) {
        expect(expectError(apiRes)).toBe(true);
      }
    });
  }
});

describe("refresh session", () => {
  const defaultParams: z.infer<typeof RefreshAccessTokenParams> = {
    accessToken: "access-token",
    refreshToken: "refresh-token",
  };

  const testCases = {
    success: {
      response: HttpResponse.json({
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
      }),
      expect: {
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
      },
      expectError: null,
    },
    unauthorized: {
      response: HttpResponse.json(undefined, { status: 401 }),
      expect: null,
      expectError: isUnauthorizedError,
    },
    forbidden: {
      response: HttpResponse.json(undefined, { status: 403 }),
      expect: null,
      expectError: isForbiddenError,
    },
    unprocessable: {
      response: HttpResponse.json(undefined, { status: 422 }),
      expect: null,
      expectError: isValidationError,
    },
    internal: {
      response: HttpResponse.json("crash", { status: 501 }),
      expect: null,
      expectError: isInternalError,
    },
  };

  for (const [key, { response, expect: expected, expectError }] of Object.entries(testCases)) {
    it(`returns ${key} response`, async () => {
      server.use(
        http
          .patch("http://localhost:3000/session/refresh")
          .searchParams(
            new URLSearchParams({ accessToken: defaultParams.accessToken, refreshToken: defaultParams.refreshToken }),
            true,
            HttpResponse.error()
          )
          .resolve(() => response)
      );

      const apiRes = await refreshSession(defaultParams).catch((e) => e);

      if (expected) {
        expect(apiRes).toEqual(expected);
      } else if (expectError) {
        expect(expectError(apiRes)).toBe(true);
      }
    });
  }
});
