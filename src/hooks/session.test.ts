import { MockQueryClient } from "#/mocks/query_client";
import { genericSetup } from "#/utils/setup";
import { QueryWrapper } from "#/utils/wrapper";

import { AccessToken, Claims, ClaimsRoleEnum, LoginForm, RefreshAccessTokenParams } from "@/api";
import { CheckSession, CreateAnonymousSession, CreateSession, NewRefreshToken, RefreshSession } from "@/hooks";

import { QueryClient } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
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

    const queryClient = new QueryClient(MockQueryClient);

    const nockSession = nockAPI
      .get("/session", undefined, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(200, res);

    const hook = renderHook(() => CheckSession.useAPI("access-token"), {
      wrapper: QueryWrapper(queryClient),
    });

    await waitFor(() => {
      expect(nockSession.isDone()).toBe(true);
      expect(hook.result.current.data).toEqual(res);
    });
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

    const queryClient = new QueryClient(MockQueryClient);

    const nockSession = nockAPI.put("/session", defaultForm).reply(200, res);

    const hook = renderHook(CreateSession.useAPI, {
      wrapper: QueryWrapper(queryClient),
    });

    await act(async () => {
      const apiRes = await hook.result.current.mutateAsync(defaultForm);
      expect(apiRes).toEqual(res);
    });

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

    const queryClient = new QueryClient(MockQueryClient);

    const nockSession = nockAPI.put("/session/anon").reply(200, res);

    const hook = renderHook(CreateAnonymousSession.useAPI, {
      wrapper: QueryWrapper(queryClient),
    });

    await act(async () => {
      const apiRes = await hook.result.current.mutateAsync();
      expect(apiRes).toEqual(res);
    });

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

    const queryClient = new QueryClient(MockQueryClient);

    const nockSession = nockAPI
      .patch(
        `/session/refresh?accessToken=${encodeURIComponent(defaultParams.accessToken)}&refreshToken=${encodeURIComponent(defaultParams.refreshToken)}`
      )
      .reply(200, res);

    const hook = renderHook(RefreshSession.useAPI, {
      wrapper: QueryWrapper(queryClient),
    });

    await act(async () => {
      const apiRes = await hook.result.current.mutateAsync(defaultParams);
      expect(apiRes).toEqual(res);
    });

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

    const queryClient = new QueryClient(MockQueryClient);

    const nockSession = nockAPI
      .put("/session/refresh", undefined, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(200, res);

    const hook = renderHook((accessToken) => NewRefreshToken.useAPI(accessToken), {
      initialProps: "access-token",
      wrapper: QueryWrapper(queryClient),
    });

    await act(async () => {
      const apiRes = await hook.result.current.mutateAsync();
      expect(apiRes).toEqual("new-refresh-token");
    });

    expect(nockSession.isDone()).toBe(true);
  });
});
