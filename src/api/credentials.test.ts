import { server } from "../../__test__/utils/setup";
import {
  CredentialsRoleEnum,
  EmailExistsParams,
  RegisterForm,
  ResetPasswordForm,
  UpdateEmailForm,
  UpdatePasswordForm,
  UpdateRoleForm,
  createUser,
  emailExists,
  resetPassword,
  updateEmail,
  updatePassword,
  updateRole,
  isEmailTakenError,
  isForbiddenError,
  isInternalError,
  isUnauthorizedError,
  isUserNotFoundError,
  isValidationError,
} from "./index";

import { http } from "@a-novel/nodelib/msw";

import { HttpResponse } from "msw";
import { describe, it, expect } from "vitest";
import { z } from "zod";

describe("create user", () => {
  const defaultForm: z.infer<typeof RegisterForm> = {
    email: "user@email.com",
    password: "password",
    shortCode: "short-code",
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
    conflict: {
      response: HttpResponse.json(undefined, { status: 410 }),
      expect: null,
      expectError: isEmailTakenError,
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
          .put("http://localhost:3000/credentials")
          .headers(new Headers({ Authorization: "Bearer access-token" }), HttpResponse.error())
          .bodyJSON(defaultForm, HttpResponse.error())
          .resolve(() => response)
      );

      const apiRes = await createUser("access-token", defaultForm).catch((e) => e);

      if (expected) {
        expect(apiRes).toEqual(expected);
      } else if (expectError) {
        expect(expectError(apiRes)).toBe(true);
      }
    });
  }
});

describe("email exists", () => {
  const defaultParams: z.infer<typeof EmailExistsParams> = {
    email: "user@email.com",
  };

  const testCases = {
    success: {
      response: HttpResponse.json(undefined, { status: 200 }),
      expect: true,
      expectError: null,
    },
    notFound: {
      response: HttpResponse.json(undefined, { status: 404 }),
      expect: false,
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
          .get("http://localhost:3000/credentials/email")
          .headers(new Headers({ Authorization: "Bearer access-token" }), HttpResponse.error())
          .searchParams(new URLSearchParams(defaultParams), true, HttpResponse.error())
          .resolve(() => response)
      );

      const apiRes = await emailExists("access-token", defaultParams).catch((e) => e);

      if (expected !== null) {
        expect(apiRes).toBe(expected);
      } else if (expectError) {
        expect(expectError(apiRes)).toBe(true);
      }
    });
  }
});

describe("update email", () => {
  const defaultForm: z.infer<typeof UpdateEmailForm> = {
    userID: "user-id",
    shortCode: "short-code",
  };

  const testCases = {
    success: {
      response: HttpResponse.json({ email: "user@email.com" }, { status: 200 }),
      expect: "user@email.com",
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
    notFound: {
      response: HttpResponse.json(undefined, { status: 404 }),
      expect: null,
      expectError: isUserNotFoundError,
    },
    conflict: {
      response: HttpResponse.json(undefined, { status: 410 }),
      expect: null,
      expectError: isEmailTakenError,
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
          .patch("http://localhost:3000/credentials/email")
          .headers(new Headers({ Authorization: "Bearer access-token" }), HttpResponse.error())
          .bodyJSON(defaultForm, HttpResponse.error())
          .resolve(() => response)
      );

      const apiRes = await updateEmail("access-token", defaultForm).catch((e) => e);

      if (expected !== null) {
        expect(apiRes).toEqual(expected);
      } else if (expectError) {
        expect(expectError(apiRes)).toBe(true);
      }
    });
  }
});

describe("update password", () => {
  const defaultForm: z.infer<typeof UpdatePasswordForm> = {
    password: "new-password",
    currentPassword: "current-password",
  };

  const testCases = {
    success: {
      response: HttpResponse.json(undefined, { status: 201 }),
      expect: undefined,
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
          .patch("http://localhost:3000/credentials/password")
          .headers(new Headers({ Authorization: "Bearer access-token" }), HttpResponse.error())
          .bodyJSON(defaultForm, HttpResponse.error())
          .resolve(() => response)
      );

      const apiRes = await updatePassword("access-token", defaultForm).catch((e) => e);

      if (expected !== null) {
        expect(apiRes).toEqual(expected);
      } else if (expectError) {
        expect(expectError(apiRes)).toBe(true);
      }
    });
  }
});

describe("update role", () => {
  const defaultForm: z.infer<typeof UpdateRoleForm> = {
    userID: "user-id",
    role: CredentialsRoleEnum.Admin,
  };

  const testCases = {
    success: {
      response: HttpResponse.json(
        {
          id: "94b4d288-dbff-4eca-805a-f45311a34e15",
          email: "user@email.com",
          role: CredentialsRoleEnum.Admin,
          createdAt: "2025-05-05T10:56:25.468Z",
          updatedAt: "2025-05-05T10:56:25.468Z",
        },
        { status: 200 }
      ),
      expect: {
        id: "94b4d288-dbff-4eca-805a-f45311a34e15",
        email: "user@email.com",
        role: CredentialsRoleEnum.Admin,
        createdAt: new Date("2025-05-05T10:56:25.468Z"),
        updatedAt: new Date("2025-05-05T10:56:25.468Z"),
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
    notFound: {
      response: HttpResponse.json(undefined, { status: 404 }),
      expect: null,
      expectError: isUserNotFoundError,
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
          .patch("http://localhost:3000/credentials/role")
          .headers(new Headers({ Authorization: "Bearer access-token" }), HttpResponse.error())
          .bodyJSON(defaultForm, HttpResponse.error())
          .resolve(() => response)
      );

      const apiRes = await updateRole("access-token", defaultForm).catch((e) => e);

      if (expected !== null) {
        expect(apiRes).toEqual(expected);
      } else if (expectError) {
        expect(expectError(apiRes)).toBe(true);
      }
    });
  }
});

describe("reset password", () => {
  const defaultForm: z.infer<typeof ResetPasswordForm> = {
    userID: "29f71c01-5ae1-4b01-b729-e17488538e15",
    password: "new-password",
    shortCode: "short-code",
  };

  const testCases = {
    success: {
      response: HttpResponse.json(undefined, { status: 201 }),
      expect: undefined,
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
          .patch("http://localhost:3000/credentials/password/reset")
          .headers(new Headers({ Authorization: "Bearer access-token" }), HttpResponse.error())
          .bodyJSON(defaultForm, HttpResponse.error())
          .resolve(() => response)
      );

      const apiRes = await resetPassword("access-token", defaultForm).catch((e) => e);

      if (expected !== null) {
        expect(apiRes).toEqual(expected);
      } else if (expectError) {
        expect(expectError(apiRes)).toBe(true);
      }
    });
  }
});
