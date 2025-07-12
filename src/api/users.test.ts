import { genericSetup } from "../../__test__/utils/setup";
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
  User,
} from "./index";

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
    ];

    const nockUsers = nockAPI
      .get(`/users?roles=admin&roles=user&limit=10&offset=20`, undefined, {
        reqheaders: { Authorization: "Bearer access-token" },
      })
      .reply(200, res);

    const apiRes = await listUsers("access-token", defaultParams);
    expect(apiRes).toEqual(res);

    nockUsers.done();
  });

  it("returns unauthorized", async () => {
    const nockUsers = nockAPI
      .get(`/users?roles=admin&roles=user&limit=10&offset=20`, undefined, {
        reqheaders: { Authorization: "Bearer access-token" },
      })
      .reply(401, undefined);

    const apiRes = await listUsers("access-token", defaultParams).catch((e) => e);
    expect(isUnauthorizedError(apiRes)).toBe(true);
    nockUsers.done();
  });

  it("returns forbidden", async () => {
    const nockUsers = nockAPI
      .get(`/users?roles=admin&roles=user&limit=10&offset=20`, undefined, {
        reqheaders: { Authorization: "Bearer access-token" },
      })
      .reply(403, undefined);

    const apiRes = await listUsers("access-token", defaultParams).catch((e) => e);
    expect(isForbiddenError(apiRes)).toBe(true);
    nockUsers.done();
  });

  it("returns internal", async () => {
    const nockUsers = nockAPI
      .get(`/users?roles=admin&roles=user&limit=10&offset=20`, undefined, {
        reqheaders: { Authorization: "Bearer access-token" },
      })
      .reply(501, "crash");

    const apiRes = await listUsers("access-token", defaultParams).catch((e) => e);
    expect(isInternalError(apiRes)).toBe(true);
    nockUsers.done();
  });
});

describe("get user", () => {
  let nockAPI: nock.Scope;

  const defaultParams: z.infer<typeof GetUserParams> = {
    userID: "29f71c01-5ae1-4b01-b729-e17488538e15",
  };

  genericSetup({
    setNockAPI: (newScope) => {
      nockAPI = newScope;
    },
  });

  it("returns successful response", async () => {
    const res: z.infer<typeof User> = {
      id: "29f71c01-5ae1-4b01-b729-e17488538e15",
      email: "user@email.com",
      role: CredentialsRoleEnum.Admin,
      createdAt: new Date("2025-05-05T10:56:25.468Z"),
      updatedAt: new Date("2025-05-05T10:56:25.468Z"),
    };

    const nockUsers = nockAPI
      .get(`/user?userID=29f71c01-5ae1-4b01-b729-e17488538e15`, undefined, {
        reqheaders: { Authorization: "Bearer access-token" },
      })
      .reply(200, res);

    const apiRes = await getUser("access-token", defaultParams);
    expect(apiRes).toEqual(res);

    nockUsers.done();
  });

  it("returns unauthorized", async () => {
    const nockUsers = nockAPI
      .get(`/user?userID=29f71c01-5ae1-4b01-b729-e17488538e15`, undefined, {
        reqheaders: { Authorization: "Bearer access-token" },
      })
      .reply(401, undefined);

    const apiRes = await getUser("access-token", defaultParams).catch((e) => e);
    expect(isUnauthorizedError(apiRes)).toBe(true);
    nockUsers.done();
  });

  it("returns forbidden", async () => {
    const nockUsers = nockAPI
      .get(`/user?userID=29f71c01-5ae1-4b01-b729-e17488538e15`, undefined, {
        reqheaders: { Authorization: "Bearer access-token" },
      })
      .reply(403, undefined);

    const apiRes = await getUser("access-token", defaultParams).catch((e) => e);
    expect(isForbiddenError(apiRes)).toBe(true);
    nockUsers.done();
  });

  it("returns not found", async () => {
    const nockUsers = nockAPI
      .get(`/user?userID=29f71c01-5ae1-4b01-b729-e17488538e15`, undefined, {
        reqheaders: { Authorization: "Bearer access-token" },
      })
      .reply(404, undefined);

    const apiRes = await getUser("access-token", defaultParams).catch((e) => e);
    expect(isUserNotFoundError(apiRes)).toBe(true);
    nockUsers.done();
  });

  it("returns internal", async () => {
    const nockUsers = nockAPI
      .get(`/user?userID=29f71c01-5ae1-4b01-b729-e17488538e15`, undefined, {
        reqheaders: { Authorization: "Bearer access-token" },
      })
      .reply(501, "crash");

    const apiRes = await getUser("access-token", defaultParams).catch((e) => e);
    expect(isInternalError(apiRes)).toBe(true);
    nockUsers.done();
  });
});
