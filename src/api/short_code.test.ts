import { server } from "../../__test__/utils/setup";
import {
  LangEnum,
  RequestEmailUpdateForm,
  RequestPasswordResetForm,
  RequestRegistrationForm,
  isInternalError,
  isUnauthorizedError,
  requestEmailUpdate,
  requestPasswordReset,
  requestRegistration,
  isForbiddenError,
  isUserNotFoundError,
} from "./index";

import { http } from "@a-novel/nodelib/msw";

import { HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { z } from "zod";

describe("request registration", () => {
  const defaultForm: z.infer<typeof RequestRegistrationForm> = {
    email: "user@email.com",
    lang: LangEnum.Fr,
  };

  const testCases = {
    success: {
      response: HttpResponse.json(undefined, { status: 200 }),
      expectError: null,
    },
    unauthorized: {
      response: HttpResponse.json(undefined, { status: 401 }),
      expectError: isUnauthorizedError,
    },
    forbidden: {
      response: HttpResponse.json(undefined, { status: 403 }),
      expectError: isForbiddenError,
    },
    internal: {
      response: HttpResponse.json("crash", { status: 501 }),
      expectError: isInternalError,
    },
  };

  for (const [key, { response, expectError }] of Object.entries(testCases)) {
    it(`returns ${key} response`, async () => {
      server.use(
        http
          .put("http://localhost:3000/short-code/register")
          .headers(new Headers({ Authorization: "Bearer access-token" }), HttpResponse.error())
          .bodyJSON(defaultForm, HttpResponse.error())
          .resolve(() => response)
      );

      const apiRes = await requestRegistration("access-token", defaultForm).catch((e) => e);

      if (expectError) {
        expect(expectError(apiRes)).toBe(true);
      } else {
        expect(apiRes).toBeUndefined();
      }
    });
  }
});

describe("request email update", () => {
  const defaultForm: z.infer<typeof RequestEmailUpdateForm> = {
    email: "user@email.com",
    lang: LangEnum.Fr,
  };

  const testCases = {
    success: {
      response: HttpResponse.json(undefined, { status: 200 }),
      expectError: null,
    },
    unauthorized: {
      response: HttpResponse.json(undefined, { status: 401 }),
      expectError: isUnauthorizedError,
    },
    forbidden: {
      response: HttpResponse.json(undefined, { status: 403 }),
      expectError: isForbiddenError,
    },
    internal: {
      response: HttpResponse.json("crash", { status: 501 }),
      expectError: isInternalError,
    },
  };

  for (const [key, { response, expectError }] of Object.entries(testCases)) {
    it(`returns ${key} response`, async () => {
      server.use(
        http
          .put("http://localhost:3000/short-code/update-email")
          .headers(new Headers({ Authorization: "Bearer access-token" }), HttpResponse.error())
          .bodyJSON(defaultForm, HttpResponse.error())
          .resolve(() => response)
      );

      const apiRes = await requestEmailUpdate("access-token", defaultForm).catch((e) => e);

      if (expectError) {
        expect(expectError(apiRes)).toBe(true);
      } else {
        expect(apiRes).toBeUndefined();
      }
    });
  }
});

describe("request password reset", () => {
  const defaultForm: z.infer<typeof RequestPasswordResetForm> = {
    email: "user@email.com",
    lang: LangEnum.Fr,
  };

  const testCases = {
    success: {
      response: HttpResponse.json(undefined, { status: 200 }),
      expectError: null,
    },
    unauthorized: {
      response: HttpResponse.json(undefined, { status: 401 }),
      expectError: isUnauthorizedError,
    },
    forbidden: {
      response: HttpResponse.json(undefined, { status: 403 }),
      expectError: isForbiddenError,
    },
    notFound: {
      response: HttpResponse.json(undefined, { status: 404 }),
      expectError: isUserNotFoundError,
    },
    internal: {
      response: HttpResponse.json("crash", { status: 501 }),
      expectError: isInternalError,
    },
  };

  for (const [key, { response, expectError }] of Object.entries(testCases)) {
    it(`returns ${key} response`, async () => {
      server.use(
        http
          .put("http://localhost:3000/short-code/update-password")
          .headers(new Headers({ Authorization: "Bearer access-token" }), HttpResponse.error())
          .bodyJSON(defaultForm, HttpResponse.error())
          .resolve(() => response)
      );

      const apiRes = await requestPasswordReset("access-token", defaultForm).catch((e) => e);

      if (expectError) {
        expect(expectError(apiRes)).toBe(true);
      } else {
        expect(apiRes).toBeUndefined();
      }
    });
  }
});
