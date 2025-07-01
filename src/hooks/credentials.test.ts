import { MockQueryClient } from "../../__test__/mocks/query_client";
import { genericSetup } from "../../__test__/utils/setup";
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

import { QueryClient } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import nock from "nock";
import { describe, it, expect } from "vitest";
import { z } from "zod";

describe("create user", () => {
  let nockAPI: nock.Scope;

  const defaultForm: z.infer<typeof RegisterForm> = {
    email: "user@email.com",
    password: "password",
    shortCode: "short-code",
  };

  genericSetup({
    setNockAPI: (newScope) => {
      nockAPI = newScope;
    },
  });

  it("returns successful response", async () => {
    const res: z.infer<typeof TokenResponse> = {
      accessToken: "new-access-token",
      refreshToken: "new-refresh-token",
    };

    const queryClient = new QueryClient(MockQueryClient);

    const nockCredentials = nockAPI
      .put("/credentials", defaultForm, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(200, res);

    const hook = renderHook((accessToken) => CreateUser.useAPI(accessToken), {
      initialProps: "access-token",
      wrapper: QueryWrapper(queryClient),
    });

    await act(async () => {
      const apiRes = await hook.result.current.mutateAsync(defaultForm);
      expect(apiRes).toEqual(res);
    });

    nockCredentials.done();
  });

  it("invalidates email exists queries", async () => {
    const res: z.infer<typeof TokenResponse> = {
      accessToken: "new-access-token",
      refreshToken: "new-refresh-token",
    };

    const queryClient = new QueryClient(MockQueryClient);

    let nockExistsEmails = nockAPI
      .get(`/credentials/email?email=${encodeURIComponent("user@email.com")}`, undefined, {
        reqheaders: { Authorization: "Bearer access-token" },
      })
      .reply(404, undefined)
      .get(`/credentials/email?email=${encodeURIComponent("user2@email.com")}`, undefined, {
        reqheaders: { Authorization: "Bearer access-token" },
      })
      .reply(200, undefined);

    const email1ExistsHook = renderHook(() => EmailExists.useAPI("access-token", { email: "user@email.com" }), {
      wrapper: QueryWrapper(queryClient),
    });
    const email2ExistsHook = renderHook(() => EmailExists.useAPI("access-token", { email: "user2@email.com" }), {
      wrapper: QueryWrapper(queryClient),
    });
    await waitFor(() => {
      nockExistsEmails.done();
      expect(email1ExistsHook.result.current.data).toBe(false);
      expect(email2ExistsHook.result.current.data).toBe(true);
    });

    const nockCreateUser = nockAPI
      .put("/credentials", defaultForm, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(200, res);

    // Invalidation is going to retrieve the email exists queries again.
    nockExistsEmails = nockAPI
      .get(`/credentials/email?email=${encodeURIComponent("user@email.com")}`, undefined, {
        reqheaders: { Authorization: "Bearer access-token" },
      })
      .reply(200, undefined);

    const createUserHook = renderHook((accessToken) => CreateUser.useAPI(accessToken), {
      initialProps: "access-token",
      wrapper: QueryWrapper(queryClient),
    });

    await act(async () => {
      const apiRes = await createUserHook.result.current.mutateAsync(defaultForm);
      expect(apiRes).toEqual(res);
      nockCreateUser.done();
    });

    await waitFor(() => {
      nockExistsEmails.done();
      expect(email1ExistsHook.result.current.data).toBe(true);
      expect(email2ExistsHook.result.current.data).toBe(true);
    });
  });
});

describe("email exists", () => {
  let nockAPI: nock.Scope;

  const defaultParams: z.infer<typeof EmailExistsParams> = {
    email: "user@email.com",
  };

  genericSetup({
    setNockAPI: (newScope) => {
      nockAPI = newScope;
    },
  });

  it("returns successful response", async () => {
    const queryClient = new QueryClient(MockQueryClient);

    const nockCredentials = nockAPI
      .get(`/credentials/email?email=${encodeURIComponent(defaultParams.email)}`, undefined, {
        reqheaders: { Authorization: "Bearer access-token" },
      })
      .reply(200, undefined);

    const hook = renderHook(() => EmailExists.useAPI("access-token", defaultParams), {
      wrapper: QueryWrapper(queryClient),
    });

    await waitFor(() => {
      nockCredentials.done();
      expect(hook.result.current.data).toBe(true);
    });
  });
});

describe("update email", () => {
  let nockAPI: nock.Scope;

  const defaultForm: z.infer<typeof UpdateEmailForm> = {
    userID: "user-id",
    shortCode: "short-code",
  };

  genericSetup({
    setNockAPI: (newScope) => {
      nockAPI = newScope;
    },
  });

  it("returns successful response", async () => {
    const res = {
      email: "user@email.com",
    };

    const queryClient = new QueryClient(MockQueryClient);

    const nockCredentials = nockAPI
      .patch("/credentials/email", defaultForm, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(200, res);

    const hook = renderHook((accessToken) => UpdateEmail.useAPI(accessToken), {
      initialProps: "access-token",
      wrapper: QueryWrapper(queryClient),
    });

    await act(async () => {
      const apiRes = await hook.result.current.mutateAsync(defaultForm);
      expect(apiRes).toEqual("user@email.com");
    });
    nockCredentials.done();
  });

  it("invalidates email exists queries", async () => {
    const res = {
      email: "user2@email.com",
    };

    const queryClient = new QueryClient(MockQueryClient);

    let nockExistsEmails = nockAPI
      .get(`/credentials/email?email=${encodeURIComponent("user1@email.com")}`, undefined, {
        reqheaders: { Authorization: "Bearer access-token" },
      })
      .reply(200, undefined)
      .get(`/credentials/email?email=${encodeURIComponent("user2@email.com")}`, undefined, {
        reqheaders: { Authorization: "Bearer access-token" },
      })
      .reply(404, undefined);

    const email1ExistsHook = renderHook(() => EmailExists.useAPI("access-token", { email: "user1@email.com" }), {
      wrapper: QueryWrapper(queryClient),
    });
    const email2ExistsHook = renderHook(() => EmailExists.useAPI("access-token", { email: "user2@email.com" }), {
      wrapper: QueryWrapper(queryClient),
    });
    await waitFor(() => {
      nockExistsEmails.done();
      expect(email1ExistsHook.result.current.data).toBe(true);
      expect(email2ExistsHook.result.current.data).toBe(false);
    });

    const nockUpdateEmail = nockAPI
      .patch("/credentials/email", defaultForm, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(200, res);

    // Invalidation is going to retrieve the email exists queries again.
    nockExistsEmails = nockAPI
      .get(`/credentials/email?email=${encodeURIComponent("user1@email.com")}`, undefined, {
        reqheaders: { Authorization: "Bearer access-token" },
      })
      .reply(404, undefined)
      .get(`/credentials/email?email=${encodeURIComponent("user2@email.com")}`, undefined, {
        reqheaders: { Authorization: "Bearer access-token" },
      })
      .reply(200, undefined);

    const updateEmailHook = renderHook((accessToken) => UpdateEmail.useAPI(accessToken), {
      initialProps: "access-token",
      wrapper: QueryWrapper(queryClient),
    });

    await act(async () => {
      await updateEmailHook.result.current.mutateAsync(defaultForm);
    });
    nockUpdateEmail.done();

    await waitFor(() => {
      nockExistsEmails.done();
      expect(email1ExistsHook.result.current.data).toBe(false);
      expect(email2ExistsHook.result.current.data).toBe(true);
    });
  });
});

describe("update password", () => {
  let nockAPI: nock.Scope;

  const defaultForm: z.infer<typeof UpdatePasswordForm> = {
    password: "new-password",
    currentPassword: "current-password",
  };

  genericSetup({
    setNockAPI: (newScope) => {
      nockAPI = newScope;
    },
  });

  it("returns successful response", async () => {
    const queryClient = new QueryClient(MockQueryClient);

    const nockCredentials = nockAPI
      .patch("/credentials/password", defaultForm, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(201, undefined);

    const hook = renderHook((accessToken) => UpdatePassword.useAPI(accessToken), {
      initialProps: "access-token",
      wrapper: QueryWrapper(queryClient),
    });

    await act(async () => {
      await hook.result.current.mutateAsync(defaultForm);
    });

    nockCredentials.done();
  });
});

describe("update role", () => {
  let nockAPI: nock.Scope;

  const defaultForm: z.infer<typeof UpdateRoleForm> = {
    userID: "user-id",
    role: CredentialsRoleEnum.Admin,
  };

  genericSetup({
    setNockAPI: (newScope) => {
      nockAPI = newScope;
    },
  });

  it("returns successful response", async () => {
    const queryClient = new QueryClient(MockQueryClient);

    const res: z.infer<typeof User> = {
      id: "00000000-0000-0000-0000-000000000001",
      email: "user@email.com",
      role: CredentialsRoleEnum.Admin,
      createdAt: new Date("2025-05-05T10:56:25.468Z"),
      updatedAt: new Date("2025-05-05T10:56:25.468Z"),
    };
    const rawRes = {
      id: "00000000-0000-0000-0000-000000000001",
      email: "user@email.com",
      role: CredentialsRoleEnum.Admin,
      createdAt: "2025-05-05T10:56:25.468Z",
      updatedAt: "2025-05-05T10:56:25.468Z",
    };

    const nockCredentials = nockAPI
      .patch("/credentials/role", defaultForm, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(200, rawRes);

    const hook = renderHook((accessToken) => UpdateRole.useAPI(accessToken), {
      initialProps: "access-token",
      wrapper: QueryWrapper(queryClient),
    });

    await act(async () => {
      const apiRes = await hook.result.current.mutateAsync(defaultForm);
      expect(apiRes).toEqual(res);
    });

    nockCredentials.done();
  });
});

describe("reset password", () => {
  let nockAPI: nock.Scope;

  const defaultForm: z.infer<typeof ResetPasswordForm> = {
    email: "user@email.com",
    password: "new-password",
    shortCode: "short-code",
  };

  genericSetup({
    setNockAPI: (newScope) => {
      nockAPI = newScope;
    },
  });

  it("returns successful response", async () => {
    const queryClient = new QueryClient(MockQueryClient);

    const nockCredentials = nockAPI
      .patch("/credentials/password/reset", defaultForm, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(201, undefined);

    const hook = renderHook((accessToken) => ResetPassword.useAPI(accessToken), {
      initialProps: "access-token",
      wrapper: QueryWrapper(queryClient),
    });

    await act(async () => {
      await hook.result.current.mutateAsync(defaultForm);
    });

    nockCredentials.done();
  });
});
