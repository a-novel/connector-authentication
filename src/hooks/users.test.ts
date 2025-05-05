import { MockQueryClient } from "#/mocks/query_client";
import { genericSetup } from "#/utils/setup";
import { QueryWrapper } from "#/utils/wrapper";

import { CredentialsRoleEnum, ListUsersParams, User } from "@/api";
import { ListUsers } from "@/hooks";

import { QueryClient } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import nock from "nock";
import { describe, expect, it } from "vitest";
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

    const queryClient = new QueryClient(MockQueryClient);

    const nockUsers = nockAPI
      .get(`/users?roles=admin&roles=user&limit=10&offset=20`, undefined, {
        reqheaders: { Authorization: "Bearer access-token" },
      })
      .reply(200, res);

    const hook = renderHook(() => ListUsers.useAPI("access-token", defaultParams), {
      wrapper: QueryWrapper(queryClient),
    });

    await waitFor(() => {
      expect(nockUsers.isDone()).toBe(true);
      expect(hook.result.current.data).toEqual(res);
    });
  });
});
