import { MockQueryClient } from "../../__test__/mocks/query_client";
import { genericSetup } from "../../__test__/utils/setup";
import { QueryWrapper } from "../../__test__/utils/wrapper";
import { CredentialsRoleEnum, GetUserParams, ListUsersParams, User } from "../api";
import { GetUser, ListUsers } from "./index";

import { QueryClient } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import nock from "nock";
import { describe, expect, it } from "vitest";
import { z } from "zod";

describe("list users", () => {
  let nockAPI: nock.Scope;

  const defaultParams: z.infer<typeof ListUsersParams> = {
    roles: [CredentialsRoleEnum.Admin, CredentialsRoleEnum.User],
    limit: 1,
  };

  genericSetup({
    setNockAPI: (newScope) => {
      nockAPI = newScope;
    },
  });
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
    {
      id: "d790b838-1742-4b8d-9d5a-d9860dcec607",
      email: "user3@email.com",
      role: CredentialsRoleEnum.User,
      createdAt: new Date("2025-05-05T10:56:25.468Z"),
      updatedAt: new Date("2025-05-05T10:56:25.468Z"),
    },
  ];

  const rawRes = [
    {
      id: "94b4d288-dbff-4eca-805a-f45311a34e15",
      email: "user@email.com",
      role: CredentialsRoleEnum.Admin,
      createdAt: "2025-05-05T10:56:25.468Z",
      updatedAt: "2025-05-05T10:56:25.468Z",
    },
    {
      id: "0fb41629-58c7-4e11-9d23-dd04aec01bf2",
      email: "user2@email.com",
      role: CredentialsRoleEnum.User,
      createdAt: "2025-05-05T10:56:25.468Z",
      updatedAt: "2025-05-05T10:56:25.468Z",
    },
    {
      id: "d790b838-1742-4b8d-9d5a-d9860dcec607",
      email: "user3@email.com",
      role: CredentialsRoleEnum.User,
      createdAt: "2025-05-05T10:56:25.468Z",
      updatedAt: "2025-05-05T10:56:25.468Z",
    },
  ];

  it("returns first page", async () => {
    const queryClient = new QueryClient(MockQueryClient);

    const nockUsers = nockAPI
      .get("/users?roles=admin&roles=user&limit=1", undefined, {
        reqheaders: { Authorization: "Bearer access-token" },
      })
      .reply(200, rawRes.slice(0, 1));

    const hook = renderHook(() => ListUsers.useAPI("access-token", defaultParams), {
      wrapper: QueryWrapper(queryClient),
    });

    await waitFor(() => {
      nockUsers.done();
    });

    expect(hook.result.current.data?.pages.flat()).toEqual(res.slice(0, 1));
  });

  it("returns all pages", async () => {
    const queryClient = new QueryClient(MockQueryClient);

    let nockUsers = nockAPI
      .get("/users?roles=admin&roles=user&limit=1", undefined, {
        reqheaders: { Authorization: "Bearer access-token" },
      })
      .reply(200, rawRes.slice(0, 1));

    const hook = renderHook(() => ListUsers.useAPI("access-token", defaultParams, { maxPages: 2 }), {
      wrapper: QueryWrapper(queryClient),
    });

    await waitFor(() => {
      nockUsers.done();
      expect(hook.result.current.data?.pages.flat()).toEqual(res.slice(0, 1));
    });

    nockUsers = nockAPI
      .get("/users?roles=admin&roles=user&limit=1&offset=1", undefined, {
        reqheaders: { Authorization: "Bearer access-token" },
      })
      .reply(200, rawRes.slice(1, 2))
      .get("/users?roles=admin&roles=user&limit=1&offset=2", undefined, {
        reqheaders: { Authorization: "Bearer access-token" },
      })
      .reply(200, rawRes.slice(2, 3));

    await act(async () => {
      await hook.result.current.fetchNextPage();
      await hook.result.current.fetchNextPage();
    });

    await waitFor(() => {
      nockUsers.done();
    });
    expect(hook.result.current.data?.pages.flat()).toEqual(res.slice(1, 3));
  });

  it("paginates backwards", async () => {
    const queryClient = new QueryClient(MockQueryClient);

    let nockUsers = nockAPI
      .get("/users?limit=10", undefined, {
        reqheaders: { Authorization: "Bearer access-token" },
      })
      .reply(200, rawRes.slice(0, 1));

    const hook = renderHook(() => ListUsers.useAPI("access-token", { limit: 10 }, { maxPages: 2 }), {
      wrapper: QueryWrapper(queryClient),
    });

    await waitFor(() => {
      nockUsers.done();
      expect(hook.result.current.data?.pages.flat()).toEqual(res.slice(0, 1));
    });

    nockUsers = nockAPI
      .get("/users?limit=10&offset=1", undefined, {
        reqheaders: { Authorization: "Bearer access-token" },
      })
      .reply(200, rawRes.slice(1, 2))
      .get("/users?limit=10&offset=2", undefined, {
        reqheaders: { Authorization: "Bearer access-token" },
      })
      .reply(200, rawRes.slice(2, 3));

    await act(async () => {
      await hook.result.current.fetchNextPage();
      await hook.result.current.fetchNextPage();
    });

    await waitFor(() => {
      nockUsers.done();
    });
    expect(hook.result.current.data?.pages.flat()).toEqual(res.slice(1, 3));

    nockUsers = nockAPI
      .get("/users?limit=10", undefined, {
        reqheaders: { Authorization: "Bearer access-token" },
      })
      .reply(200, rawRes.slice(0, 1));

    await act(async () => {
      await hook.result.current.fetchPreviousPage();
    });

    await waitFor(() => {
      nockUsers.done();
    });
    expect(hook.result.current.data?.pages.flat()).toEqual(res.slice(0, 2));
  });

  it("does not fetch with missing parameters", async () => {
    const queryClient = new QueryClient(MockQueryClient);

    const nockUsers = nockAPI
      .get("/users?roles=admin&roles=user&limit=1", undefined, {
        reqheaders: { Authorization: "Bearer access-token" },
      })
      .reply(200, rawRes.slice(0, 1));

    const hook = renderHook(({ accessToken, params }) => ListUsers.useAPI(accessToken, params), {
      initialProps: {
        accessToken: "",
        params: defaultParams,
      },
      wrapper: QueryWrapper(queryClient),
    });

    act(() => {
      hook.rerender({
        accessToken: "access-token",
        params: defaultParams,
      });
    });

    await waitFor(() => {
      nockUsers.done();
    });

    expect(hook.result.current.data?.pages.flat()).toEqual(res.slice(0, 1));
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
    const queryClient = new QueryClient(MockQueryClient);

    const res: z.infer<typeof User> = {
      id: "29f71c01-5ae1-4b01-b729-e17488538e15",
      email: "user@email.com",
      role: CredentialsRoleEnum.Admin,
      createdAt: new Date("2025-05-05T10:56:25.468Z"),
      updatedAt: new Date("2025-05-05T10:56:25.468Z"),
    };

    const nockCredentials = nockAPI
      .get(`/user?userID=29f71c01-5ae1-4b01-b729-e17488538e15`, undefined, {
        reqheaders: { Authorization: "Bearer access-token" },
      })
      .reply(200, res);

    const hook = renderHook(() => GetUser.useAPI("access-token", defaultParams), {
      wrapper: QueryWrapper(queryClient),
    });

    await waitFor(() => {
      nockCredentials.done();
      expect(hook.result.current.data).toEqual(res);
    });
  });
});
