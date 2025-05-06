import { genericSetup } from "../../__test__/utils/setup";
import { CredentialsRoleEnum, isInternalError, isUnauthorizedError, listUsers, ListUsersParams, User } from "./index";

import nock from "nock";
import { describe, it, expect } from "vitest";
import { z } from "zod";

describe("list users", () => {
  let nockAPI: nock.Scope;

  const defaultParams: z.infer<typeof ListUsersParams> = {
    roles: [CredentialsRoleEnum.Admin, CredentialsRoleEnum.User],
    limit: 10,
    offset: 20,
  };

  genericSetup({
    setNockAPI: (newScope) => {
      nockAPI = newScope;
    },
  });

  it("returns successful response", async () => {
    const res: z.infer<typeof User>[] = [
      {
        id: "00000000-0000-0000-0000-000000000001",
        email: "user@email.com",
        roles: CredentialsRoleEnum.Admin,
        createdAt: new Date("2025-05-05T10:56:25.468Z"),
        updatedAt: new Date("2025-05-05T10:56:25.468Z"),
      },
      {
        id: "00000000-0000-0000-0000-000000000002",
        email: "user2@email.com",
        roles: CredentialsRoleEnum.User,
        createdAt: new Date("2025-05-05T10:56:25.468Z"),
        updatedAt: new Date("2025-05-05T10:56:25.468Z"),
      },
    ];

    const nockUsers = nockAPI
      .get(`/users?roles=admin&roles=user&limit=10&offset=20`, undefined, {
        reqheaders: { Authorization: "Bearer access-token" },
      })
      .reply(200, res);

    const apiRes = await listUsers("access-token", defaultParams);
    expect(apiRes).toEqual(res);

    expect(nockUsers.isDone()).toBe(true);
  });

  it("returns unauthorized", async () => {
    const nockUsers = nockAPI
      .get(`/users?roles=admin&roles=user&limit=10&offset=20`, undefined, {
        reqheaders: { Authorization: "Bearer access-token" },
      })
      .reply(401, undefined);

    const apiRes = await listUsers("access-token", defaultParams).catch((e) => e);
    expect(isUnauthorizedError(apiRes)).toBe(true);
    expect(nockUsers.isDone()).toBe(true);
  });

  it("returns internal", async () => {
    const nockUsers = nockAPI
      .get(`/users?roles=admin&roles=user&limit=10&offset=20`, undefined, {
        reqheaders: { Authorization: "Bearer access-token" },
      })
      .reply(501, "crash");

    const apiRes = await listUsers("access-token", defaultParams).catch((e) => e);
    expect(isInternalError(apiRes)).toBe(true);
    expect(nockUsers.isDone()).toBe(true);
  });
});
