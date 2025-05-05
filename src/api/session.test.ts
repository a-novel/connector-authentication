import { genericSetup } from "#/utils/setup";

import {
  AccessToken,
  Claims,
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
  newRefreshToken,
  refreshSession,
} from "@/api";

import nock from "nock";
import { describe, expect, it } from "vitest";
import { z } from "zod";

describe("check session", () => {
  let nockAPI: nock.Scope;

  genericSetup({
    setNockAPI: (newScope) => {
      nockAPI = newScope;
    },
  });

  it("returns successful response", async () => {
    const res: z.infer<typeof Claims> = {
      userID: "00000000-0000-0000-0000-000000000001",
      roles: [ClaimsRoleEnum.User],
    };

    const nockSession = nockAPI
      .get("/session", undefined, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(200, res);

    const apiRes = await checkSession("access-token");
    expect(apiRes).toEqual(res);

    expect(nockSession.isDone()).toBe(true);
  });

  it("returns unauthorized", async () => {
    const nockSession = nockAPI
      .get("/session", undefined, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(401, undefined);

    const apiRes = await checkSession("access-token").catch((e) => e);
    expect(isUnauthorizedError(apiRes)).toBe(true);
    expect(nockSession.isDone()).toBe(true);
  });

  it("returns internal", async () => {
    const nockSession = nockAPI
      .get("/session", undefined, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(501, "crash");

    const apiRes = await checkSession("access-token").catch((e) => e);
    expect(isInternalError(apiRes)).toBe(true);
    expect(nockSession.isDone()).toBe(true);
  });
});

describe("create session", () => {
  let nockAPI: nock.Scope;

  const defaultForm: z.infer<typeof LoginForm> = {
    email: "user@email.com",
    password: "password",
  };

  genericSetup({
    setNockAPI: (newScope) => {
      nockAPI = newScope;
    },
  });

  it("returns successful response", async () => {
    const res: z.infer<typeof AccessToken> = {
      accessToken: "new-access-token",
    };

    const nockSession = nockAPI.put("/session", defaultForm).reply(200, res);

    const apiRes = await createSession(defaultForm);
    expect(apiRes).toEqual(res);

    expect(nockSession.isDone()).toBe(true);
  });

  it("returns forbidden", async () => {
    const nockSession = nockAPI.put("/session", defaultForm).reply(403, undefined);

    const apiRes = await createSession(defaultForm).catch((e) => e);
    expect(isForbiddenError(apiRes)).toBe(true);
    expect(nockSession.isDone()).toBe(true);
  });

  it("returns user not found", async () => {
    const nockSession = nockAPI.put("/session", defaultForm).reply(404, undefined);

    const apiRes = await createSession(defaultForm).catch((e) => e);
    expect(isUserNotFoundError(apiRes)).toBe(true);
    expect(nockSession.isDone()).toBe(true);
  });

  it("returns internal", async () => {
    const nockSession = nockAPI.put("/session", defaultForm).reply(501, "crash");

    const apiRes = await createSession(defaultForm).catch((e) => e);
    expect(isInternalError(apiRes)).toBe(true);
    expect(nockSession.isDone()).toBe(true);
  });
});

describe("create anonymous session", () => {
  let nockAPI: nock.Scope;

  genericSetup({
    setNockAPI: (newScope) => {
      nockAPI = newScope;
    },
  });

  it("returns successful response", async () => {
    const res: z.infer<typeof AccessToken> = {
      accessToken: "new-access-token",
    };

    const nockSession = nockAPI.put("/session/anon").reply(200, res);

    const apiRes = await createAnonymousSession();
    expect(apiRes).toEqual(res);

    expect(nockSession.isDone()).toBe(true);
  });

  it("returns internal", async () => {
    const nockSession = nockAPI.put("/session/anon").reply(501, "crash");

    const apiRes = await createAnonymousSession().catch((e) => e);
    expect(isInternalError(apiRes)).toBe(true);
    expect(nockSession.isDone()).toBe(true);
  });
});

describe("refresh session", () => {
  let nockAPI: nock.Scope;

  const defaultParams: z.infer<typeof RefreshAccessTokenParams> = {
    accessToken: "access-token",
    refreshToken: "refresh-token",
  };

  genericSetup({
    setNockAPI: (newScope) => {
      nockAPI = newScope;
    },
  });

  it("returns successful response", async () => {
    const res: z.infer<typeof AccessToken> = {
      accessToken: "new-access-token",
    };

    const nockSession = nockAPI
      .patch(
        `/session/refresh?accessToken=${encodeURIComponent(defaultParams.accessToken)}&refreshToken=${encodeURIComponent(defaultParams.refreshToken)}`
      )
      .reply(200, res);

    const apiRes = await refreshSession(defaultParams);
    expect(apiRes).toEqual(res);

    expect(nockSession.isDone()).toBe(true);
  });

  it("returns unauthorized", async () => {
    const nockSession = nockAPI
      .patch(
        `/session/refresh?accessToken=${encodeURIComponent(defaultParams.accessToken)}&refreshToken=${encodeURIComponent(defaultParams.refreshToken)}`
      )
      .reply(401, undefined);

    const apiRes = await refreshSession(defaultParams).catch((e) => e);
    expect(isUnauthorizedError(apiRes)).toBe(true);
    expect(nockSession.isDone()).toBe(true);
  });

  it("returns forbidden", async () => {
    const nockSession = nockAPI
      .patch(
        `/session/refresh?accessToken=${encodeURIComponent(defaultParams.accessToken)}&refreshToken=${encodeURIComponent(defaultParams.refreshToken)}`
      )
      .reply(403, undefined);

    const apiRes = await refreshSession(defaultParams).catch((e) => e);
    expect(isForbiddenError(apiRes)).toBe(true);
    expect(nockSession.isDone()).toBe(true);
  });

  it("returns unprocessable entity", async () => {
    const nockSession = nockAPI
      .patch(
        `/session/refresh?accessToken=${encodeURIComponent(defaultParams.accessToken)}&refreshToken=${encodeURIComponent(defaultParams.refreshToken)}`
      )
      .reply(422, undefined);

    const apiRes = await refreshSession(defaultParams).catch((e) => e);
    expect(isValidationError(apiRes)).toBe(true);
    expect(nockSession.isDone()).toBe(true);
  });

  it("returns internal", async () => {
    const nockSession = nockAPI
      .patch(
        `/session/refresh?accessToken=${encodeURIComponent(defaultParams.accessToken)}&refreshToken=${encodeURIComponent(defaultParams.refreshToken)}`
      )
      .reply(501, "crash");

    const apiRes = await refreshSession(defaultParams).catch((e) => e);
    expect(isInternalError(apiRes)).toBe(true);
    expect(nockSession.isDone()).toBe(true);
  });
});

describe("new refresh token", () => {
  let nockAPI: nock.Scope;

  genericSetup({
    setNockAPI: (newScope) => {
      nockAPI = newScope;
    },
  });

  it("returns successful response", async () => {
    const res = {
      refreshToken: "new-refresh-token",
    };

    const nockSession = nockAPI
      .put("/session/refresh", undefined, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(200, res);

    const apiRes = await newRefreshToken("access-token");
    expect(apiRes).toEqual("new-refresh-token");

    expect(nockSession.isDone()).toBe(true);
  });

  it("returns unauthorized", async () => {
    const nockSession = nockAPI
      .put("/session/refresh", undefined, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(401, undefined);

    const apiRes = await newRefreshToken("access-token").catch((e) => e);
    expect(isUnauthorizedError(apiRes)).toBe(true);
    expect(nockSession.isDone()).toBe(true);
  });

  it("returns forbidden", async () => {
    const nockSession = nockAPI
      .put("/session/refresh", undefined, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(403, undefined);

    const apiRes = await newRefreshToken("access-token").catch((e) => e);
    expect(isForbiddenError(apiRes)).toBe(true);
    expect(nockSession.isDone()).toBe(true);
  });

  it("returns internal", async () => {
    const nockSession = nockAPI
      .put("/session/refresh", undefined, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(501, "crash");

    const apiRes = await newRefreshToken("access-token").catch((e) => e);
    expect(isInternalError(apiRes)).toBe(true);
    expect(nockSession.isDone()).toBe(true);
  });
});
