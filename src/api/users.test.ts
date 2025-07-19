import { server } from "../../__test__/utils/setup";
import {
  CredentialsRoleEnum,
  getUser,
  GetUserParams,
  isForbiddenError,
  isInternalError,
  isUnauthorizedError,
  isUserNotFoundError,
  listUsers,
  ListUsersParams,
} from "./index";

import { http } from "@a-novel/nodelib/msw";

import { HttpResponse } from "msw";
import { describe, it, expect } from "vitest";
import { z } from "zod";

describe("list users", () => {
  const defaultParams: z.infer<typeof ListUsersParams> = {
    roles: [CredentialsRoleEnum.Admin, CredentialsRoleEnum.User],
    limit: 10,
    offset: 20,
  };

  const testCases = {
    success: {
      response: HttpResponse.json(
        [
          {
            id: "94b4d288-dbff-4eca-805a-f45311a34e15",
            email: "user@email.com",
            role: CredentialsRoleEnum.Admin,
            createdAt: new Date("2025-05-05T10:56:25.468Z"),
            updatedAt: new Date("2025-05-05T10:56:25.468Z"),
          },
          {
            id: "0fb41629-58c7-4e11-9d23-dd04aec01bf2",
            email: "user2@email.com",
            role: CredentialsRoleEnum.User,
            createdAt: new Date("2025-05-05T10:56:25.468Z"),
            updatedAt: new Date("2025-05-05T10:56:25.468Z"),
          },
        ],
        { status: 200 }
      ),
      expect: [
        {
          id: "94b4d288-dbff-4eca-805a-f45311a34e15",
          email: "user@email.com",
          role: CredentialsRoleEnum.Admin,
          createdAt: new Date("2025-05-05T10:56:25.468Z"),
          updatedAt: new Date("2025-05-05T10:56:25.468Z"),
        },
        {
          id: "0fb41629-58c7-4e11-9d23-dd04aec01bf2",
          email: "user2@email.com",
          role: CredentialsRoleEnum.User,
          createdAt: new Date("2025-05-05T10:56:25.468Z"),
          updatedAt: new Date("2025-05-05T10:56:25.468Z"),
        },
      ],
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
          .get("http://localhost:3000/users")
          .headers(new Headers({ Authorization: "Bearer access-token" }), HttpResponse.error())
          .searchParams(new URLSearchParams("limit=10&offset=20&roles=admin&roles=user"), true, HttpResponse.error())
          .resolve(() => response)
      );

      const apiRes = await listUsers("access-token", defaultParams).catch((e) => e);

      if (expected) {
        expect(apiRes).toEqual(expected);
      } else if (expectError) {
        expect(expectError(apiRes)).toBe(true);
      }
    });
  }
});

describe("get user", () => {
  const defaultParams: z.infer<typeof GetUserParams> = {
    userID: "29f71c01-5ae1-4b01-b729-e17488538e15",
  };

  const testCases = {
    success: {
      response: HttpResponse.json(
        {
          id: "29f71c01-5ae1-4b01-b729-e17488538e15",
          email: "user@email.com",
          role: CredentialsRoleEnum.Admin,
          createdAt: new Date("2025-05-05T10:56:25.468Z"),
          updatedAt: new Date("2025-05-05T10:56:25.468Z"),
        },
        { status: 200 }
      ),
      expect: {
        id: "29f71c01-5ae1-4b01-b729-e17488538e15",
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
          .get("http://localhost:3000/user")
          .headers(new Headers({ Authorization: "Bearer access-token" }), HttpResponse.error())
          .searchParams(
            new URLSearchParams({ userID: "29f71c01-5ae1-4b01-b729-e17488538e15" }),
            true,
            HttpResponse.error()
          )
          .resolve(() => response)
      );

      const apiRes = await getUser("access-token", defaultParams).catch((e) => e);

      if (expected) {
        expect(apiRes).toEqual(expected);
      } else if (expectError) {
        expect(expectError(apiRes)).toBe(true);
      }
    });
  }
});
