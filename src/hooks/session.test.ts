import { MockQueryClient } from "../../__test__/mocks/query_client";
import { server } from "../../__test__/utils/setup";
import { QueryWrapper } from "../../__test__/utils/wrapper";
import { TokenResponse, Claims, ClaimsRoleEnum, LoginForm, RefreshAccessTokenParams } from "../api";
import { CheckSession, CreateAnonymousSession, CreateSession, RefreshSession } from "./index";

import { http } from "@a-novel/nodelib/msw";

import { QueryClient } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { z } from "zod";

describe("check session", () => {
  it("returns successful response", async () => {
    const res: z.infer<typeof Claims> = {
      userID: "94b4d288-dbff-4eca-805a-f45311a34e15",
      roles: [ClaimsRoleEnum.User],
    };

    const queryClient = new QueryClient(MockQueryClient);

    server.use(
      http
        .get("http://localhost:3000/session")
        .headers(new Headers({ Authorization: "Bearer access-token" }), HttpResponse.error())
        .resolve(() => HttpResponse.json(res))
    );

    const hook = renderHook(() => CheckSession.useAPI("access-token"), {
      wrapper: QueryWrapper(queryClient),
    });

    await waitFor(() => {
      expect(hook.result.current.data).toEqual(res);
    });
  });
});

describe("create session", () => {
  const defaultForm: z.infer<typeof LoginForm> = {
    email: "user@email.com",
    password: "password",
  };

  it("returns successful response", async () => {
    const res: z.infer<typeof TokenResponse> = {
      accessToken: "new-access-token",
      refreshToken: "new-refresh-token",
    };

    const queryClient = new QueryClient(MockQueryClient);

    server.use(
      http
        .put("http://localhost:3000/session")
        .bodyJSON(defaultForm, HttpResponse.error())
        .resolve(() => HttpResponse.json(res))
    );

    const hook = renderHook(CreateSession.useAPI, {
      wrapper: QueryWrapper(queryClient),
    });

    await act(async () => {
      const apiRes = await hook.result.current.mutateAsync(defaultForm);
      expect(apiRes).toEqual(res);
    });
  });

  it("refreshes session", async () => {
    const res: z.infer<typeof TokenResponse> = {
      accessToken: "new-access-token",
      refreshToken: "new-refresh-token",
    };

    const checkSessionRes: z.infer<typeof Claims> = {
      userID: "94b4d288-dbff-4eca-805a-f45311a34e15",
      roles: [ClaimsRoleEnum.User],
    };

    const queryClient = new QueryClient(MockQueryClient);

    server.use(
      http
        .get("http://localhost:3000/session")
        .headers(new Headers({ Authorization: "Bearer access-token" }), HttpResponse.error())
        .resolve(() => HttpResponse.json(checkSessionRes)),
      http
        .put("http://localhost:3000/session")
        .bodyJSON(defaultForm, HttpResponse.error())
        .resolve(() => HttpResponse.json(res))
    );

    renderHook(() => CheckSession.useAPI("access-token"), {
      wrapper: QueryWrapper(queryClient),
    });

    const hook = renderHook(CreateSession.useAPI, {
      wrapper: QueryWrapper(queryClient),
    });

    await act(async () => {
      const apiRes = await hook.result.current.mutateAsync(defaultForm);
      expect(apiRes).toEqual(res);
    });
  });
});

describe("create anonymous session", () => {
  it("returns successful response", async () => {
    const res: z.infer<typeof TokenResponse> = {
      accessToken: "new-access-token",
    };

    const queryClient = new QueryClient(MockQueryClient);

    server.use(http.put("http://localhost:3000/session/anon").resolve(() => HttpResponse.json(res)));

    const hook = renderHook(CreateAnonymousSession.useAPI, {
      wrapper: QueryWrapper(queryClient),
    });

    await act(async () => {
      const apiRes = await hook.result.current.mutateAsync();
      expect(apiRes).toEqual(res);
    });
  });

  it("refreshes session", async () => {
    const res: z.infer<typeof TokenResponse> = {
      accessToken: "new-access-token",
      refreshToken: "new-refresh-token",
    };

    const checkSessionRes: z.infer<typeof Claims> = {
      userID: "94b4d288-dbff-4eca-805a-f45311a34e15",
      roles: [ClaimsRoleEnum.User],
    };

    const queryClient = new QueryClient(MockQueryClient);

    server.use(
      http
        .get("http://localhost:3000/session")
        .headers(new Headers({ Authorization: "Bearer access-token" }), HttpResponse.error())
        .resolve(() => HttpResponse.json(checkSessionRes)),
      http.put("http://localhost:3000/session/anon").resolve(() => HttpResponse.json(res))
    );

    renderHook(() => CheckSession.useAPI("access-token"), {
      wrapper: QueryWrapper(queryClient),
    });

    const hook = renderHook(CreateAnonymousSession.useAPI, {
      wrapper: QueryWrapper(queryClient),
    });

    await act(async () => {
      const apiRes = await hook.result.current.mutateAsync();
      expect(apiRes).toEqual(res);
    });
  });
});

describe("refresh session", () => {
  const defaultParams: z.infer<typeof RefreshAccessTokenParams> = {
    accessToken: "access-token",
    refreshToken: "refresh-token",
  };

  it("returns successful response", async () => {
    const res: z.infer<typeof TokenResponse> = {
      accessToken: "new-access-token",
      refreshToken: "new-refresh-token",
    };

    const queryClient = new QueryClient(MockQueryClient);

    server.use(
      http
        .patch("http://localhost:3000/session/refresh")
        .searchParams(
          new URLSearchParams({ accessToken: defaultParams.accessToken, refreshToken: defaultParams.refreshToken }),
          true,
          HttpResponse.error()
        )
        .resolve(() => HttpResponse.json(res))
    );

    const hook = renderHook(RefreshSession.useAPI, {
      wrapper: QueryWrapper(queryClient),
    });

    await act(async () => {
      const apiRes = await hook.result.current.mutateAsync(defaultParams);
      expect(apiRes).toEqual(res);
    });
  });

  it("refreshes session", async () => {
    const res: z.infer<typeof TokenResponse> = {
      accessToken: "new-access-token",
      refreshToken: "new-refresh-token",
    };

    const checkSessionRes: z.infer<typeof Claims> = {
      userID: "94b4d288-dbff-4eca-805a-f45311a34e15",
      roles: [ClaimsRoleEnum.User],
    };

    const queryClient = new QueryClient(MockQueryClient);

    server.use(
      http
        .patch("http://localhost:3000/session/refresh")
        .searchParams(
          new URLSearchParams({ accessToken: defaultParams.accessToken, refreshToken: defaultParams.refreshToken }),
          true,
          HttpResponse.error()
        )
        .resolve(() => HttpResponse.json(res)),
      http
        .get("http://localhost:3000/session")
        .headers(new Headers({ Authorization: "Bearer access-token" }), HttpResponse.error())
        .resolve(() => HttpResponse.json(checkSessionRes))
    );

    renderHook(() => CheckSession.useAPI("access-token"), {
      wrapper: QueryWrapper(queryClient),
    });

    const hook = renderHook(RefreshSession.useAPI, {
      wrapper: QueryWrapper(queryClient),
    });

    await act(async () => {
      const apiRes = await hook.result.current.mutateAsync(defaultParams);
      expect(apiRes).toEqual(res);
    });
  });
});
