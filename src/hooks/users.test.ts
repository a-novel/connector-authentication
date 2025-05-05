import { MockQueryClient } from "#/mocks/query_client";
import { genericSetup } from "#/utils/setup";
import { QueryWrapper } from "#/utils/wrapper";

import { CredentialsRoleEnum, ListUsersParams, User } from "@/api";
import { ListUsers } from "@/hooks";

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
    {
      id: "00000000-0000-0000-0000-000000000003",
      email: "user3@email.com",
      roles: CredentialsRoleEnum.User,
      createdAt: new Date("2025-05-05T10:56:25.468Z"),
      updatedAt: new Date("2025-05-05T10:56:25.468Z"),
    },
  ];

  const rawRes = [
    {
      id: "00000000-0000-0000-0000-000000000001",
      email: "user@email.com",
      roles: CredentialsRoleEnum.Admin,
      createdAt: "2025-05-05T10:56:25.468Z",
      updatedAt: "2025-05-05T10:56:25.468Z",
    },
    {
      id: "00000000-0000-0000-0000-000000000002",
      email: "user2@email.com",
      roles: CredentialsRoleEnum.User,
      createdAt: "2025-05-05T10:56:25.468Z",
      updatedAt: "2025-05-05T10:56:25.468Z",
    },
    {
      id: "00000000-0000-0000-0000-000000000003",
      email: "user3@email.com",
      roles: CredentialsRoleEnum.User,
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
      expect(nockUsers.isDone()).toBe(true);
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
      expect(nockUsers.isDone()).toBe(true);
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
      expect(nockUsers.isDone()).toBe(true);
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
      expect(nockUsers.isDone()).toBe(true);
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
      expect(nockUsers.isDone()).toBe(true);
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
      expect(nockUsers.isDone()).toBe(true);
    });
    expect(hook.result.current.data?.pages.flat()).toEqual(res.slice(0, 2));
  });
});
