import { MockQueryClient } from "../../__test__/mocks/query_client";
import { server } from "../../__test__/utils/setup";
import { QueryWrapper } from "../../__test__/utils/wrapper";
import {
  TokenResponse,
  CredentialsRoleEnum,
  EmailExistsParams,
  RegisterForm,
  ResetPasswordForm,
  UpdateEmailForm,
  UpdatePasswordForm,
  UpdateRoleForm,
  User,
} from "../api";
import { CreateUser, EmailExists, ResetPassword, UpdateEmail, UpdatePassword, UpdateRole } from "./index";

import { http } from "@a-novel/nodelib/msw";

import { QueryClient } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { HttpResponse } from "msw";
import { describe, it, expect } from "vitest";
import { z } from "zod";

describe("create user", () => {
  const defaultForm: z.infer<typeof RegisterForm> = {
    email: "user@email.com",
    password: "password",
    shortCode: "short-code",
  };

  it("returns successful response", async () => {
    const res: z.infer<typeof TokenResponse> = {
      accessToken: "new-access-token",
      refreshToken: "new-refresh-token",
    };

    const queryClient = new QueryClient(MockQueryClient);

    server.use(
      http
        .put("http://localhost:3000/credentials")
        .headers(new Headers({ Authorization: "Bearer access-token" }), HttpResponse.error())
        .bodyJSON(defaultForm, HttpResponse.error())
        .resolve(() => HttpResponse.json(res))
    );

    const hook = renderHook((accessToken) => CreateUser.useAPI(accessToken), {
      initialProps: "access-token",
      wrapper: QueryWrapper(queryClient),
    });

    await act(async () => {
      const apiRes = await hook.result.current.mutateAsync(defaultForm);
      expect(apiRes).toEqual(res);
    });
  });
});

describe("email exists", () => {
  const defaultParams: z.infer<typeof EmailExistsParams> = {
    email: "user@email.com",
  };

  it("returns successful response", async () => {
    const queryClient = new QueryClient(MockQueryClient);

    server.use(
      http
        .get("http://localhost:3000/credentials/email")
        .headers(new Headers({ Authorization: "Bearer access-token" }), HttpResponse.error())
        .searchParams(new URLSearchParams(defaultParams), true, HttpResponse.error())
        .resolve(() => HttpResponse.json(undefined, { status: 200 }))
    );

    const hook = renderHook(() => EmailExists.useAPI("access-token", defaultParams), {
      wrapper: QueryWrapper(queryClient),
    });

    await waitFor(() => {
      expect(hook.result.current.data).toBe(true);
    });
  });
});

describe("update email", () => {
  const defaultForm: z.infer<typeof UpdateEmailForm> = {
    userID: "user-id",
    shortCode: "short-code",
  };

  it("returns successful response", async () => {
    const res = {
      email: "user@email.com",
    };

    const queryClient = new QueryClient(MockQueryClient);

    server.use(
      http
        .patch("http://localhost:3000/credentials/email")
        .headers(new Headers({ Authorization: "Bearer access-token" }), HttpResponse.error())
        .bodyJSON(defaultForm, HttpResponse.error())
        .resolve(() => HttpResponse.json(res))
    );

    const hook = renderHook((accessToken) => UpdateEmail.useAPI(accessToken), {
      initialProps: "access-token",
      wrapper: QueryWrapper(queryClient),
    });

    await act(async () => {
      const apiRes = await hook.result.current.mutateAsync(defaultForm);
      expect(apiRes).toEqual("user@email.com");
    });
  });
});

describe("update password", () => {
  const defaultForm: z.infer<typeof UpdatePasswordForm> = {
    password: "new-password",
    currentPassword: "current-password",
  };

  it("returns successful response", async () => {
    const queryClient = new QueryClient(MockQueryClient);

    server.use(
      http
        .patch("http://localhost:3000/credentials/password")
        .headers(new Headers({ Authorization: "Bearer access-token" }), HttpResponse.error())
        .bodyJSON(defaultForm, HttpResponse.error())
        .resolve(() => HttpResponse.json(undefined, { status: 201 }))
    );

    const hook = renderHook((accessToken) => UpdatePassword.useAPI(accessToken), {
      initialProps: "access-token",
      wrapper: QueryWrapper(queryClient),
    });

    await act(async () => {
      await hook.result.current.mutateAsync(defaultForm);
    });
  });
});

describe("update role", () => {
  const defaultForm: z.infer<typeof UpdateRoleForm> = {
    userID: "user-id",
    role: CredentialsRoleEnum.Admin,
  };

  it("returns successful response", async () => {
    const queryClient = new QueryClient(MockQueryClient);

    const res: z.infer<typeof User> = {
      id: "94b4d288-dbff-4eca-805a-f45311a34e15",
      email: "user@email.com",
      role: CredentialsRoleEnum.Admin,
      createdAt: new Date("2025-05-05T10:56:25.468Z"),
      updatedAt: new Date("2025-05-05T10:56:25.468Z"),
    };
    const rawRes = {
      id: "94b4d288-dbff-4eca-805a-f45311a34e15",
      email: "user@email.com",
      role: CredentialsRoleEnum.Admin,
      createdAt: "2025-05-05T10:56:25.468Z",
      updatedAt: "2025-05-05T10:56:25.468Z",
    };

    server.use(
      http
        .patch("http://localhost:3000/credentials/role")
        .headers(new Headers({ Authorization: "Bearer access-token" }), HttpResponse.error())
        .bodyJSON(defaultForm, HttpResponse.error())
        .resolve(() => HttpResponse.json(rawRes))
    );

    const hook = renderHook((accessToken) => UpdateRole.useAPI(accessToken), {
      initialProps: "access-token",
      wrapper: QueryWrapper(queryClient),
    });

    await act(async () => {
      const apiRes = await hook.result.current.mutateAsync(defaultForm);
      expect(apiRes).toEqual(res);
    });
  });
});

describe("reset password", () => {
  const defaultForm: z.infer<typeof ResetPasswordForm> = {
    userID: "29f71c01-5ae1-4b01-b729-e17488538e15",
    password: "new-password",
    shortCode: "short-code",
  };

  it("returns successful response", async () => {
    const queryClient = new QueryClient(MockQueryClient);

    server.use(
      http
        .patch("http://localhost:3000/credentials/password/reset")
        .headers(new Headers({ Authorization: "Bearer access-token" }), HttpResponse.error())
        .bodyJSON(defaultForm, HttpResponse.error())
        .resolve(() => HttpResponse.json(undefined, { status: 201 }))
    );

    const hook = renderHook((accessToken) => ResetPassword.useAPI(accessToken), {
      initialProps: "access-token",
      wrapper: QueryWrapper(queryClient),
    });

    await act(async () => {
      await hook.result.current.mutateAsync(defaultForm);
    });
  });
});
