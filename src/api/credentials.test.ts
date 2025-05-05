import { genericSetup } from "#/utils/setup";

import {
  AccessToken,
  CredentialsRoleEnum,
  EmailExistsParams,
  RegisterForm,
  ResetPasswordForm,
  UpdateEmailForm,
  UpdatePasswordForm,
  UpdateRoleForm,
  User,
  createUser,
  emailExists,
  resetPassword,
  updateEmail,
  updatePassword,
  updateRole,
  isEmailTakenError,
  isForbiddenError,
  isInternalError,
  isUnauthorizedError,
  isUserNotFoundError,
  isValidationError,
} from "@/api";

import nock from "nock";
import { describe, it, expect } from "vitest";
import { z } from "zod";

describe("create user", () => {
  let nockAPI: nock.Scope;

  const defautlForm: z.infer<typeof RegisterForm> = {
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
    const res: z.infer<typeof AccessToken> = {
      accessToken: "new-access-token",
    };

    const nockCredentials = nockAPI
      .put("/credentials", defautlForm, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(200, res);

    const apiRes = await createUser("access-token", defautlForm);
    expect(apiRes).toEqual(res);

    expect(nockCredentials.isDone()).toBe(true);
  });

  it("returns unauthorized", async () => {
    const nockCredentials = nockAPI
      .put("/credentials", defautlForm, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(401, undefined);

    const apiRes = await createUser("access-token", defautlForm).catch((e) => e);
    expect(isUnauthorizedError(apiRes)).toBe(true);
    expect(nockCredentials.isDone()).toBe(true);
  });

  it("returns forbidden", async () => {
    const nockCredentials = nockAPI
      .put("/credentials", defautlForm, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(403, undefined);

    const apiRes = await createUser("access-token", defautlForm).catch((e) => e);
    expect(isForbiddenError(apiRes)).toBe(true);
    expect(nockCredentials.isDone()).toBe(true);
  });

  it("returns conflict", async () => {
    const nockCredentials = nockAPI
      .put("/credentials", defautlForm, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(410, undefined);

    const apiRes = await createUser("access-token", defautlForm).catch((e) => e);
    expect(isEmailTakenError(apiRes)).toBe(true);
    expect(nockCredentials.isDone()).toBe(true);
  });

  it("returns internal", async () => {
    const nockCredentials = nockAPI
      .put("/credentials", defautlForm, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(501, "crash");

    const apiRes = await createUser("access-token", defautlForm).catch((e) => e);
    expect(isInternalError(apiRes)).toBe(true);
    expect(nockCredentials.isDone()).toBe(true);
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
    const nockCredentials = nockAPI
      .get(`/credentials/email?email=${encodeURIComponent(defaultParams.email)}`, undefined, {
        reqheaders: { Authorization: "Bearer access-token" },
      })
      .reply(200, undefined);

    const apiRes = await emailExists("access-token", defaultParams);
    expect(apiRes).toBe(true);

    expect(nockCredentials.isDone()).toBe(true);
  });

  it("returns not found", async () => {
    const nockCredentials = nockAPI
      .get(`/credentials/email?email=${defaultParams.email}`, undefined, {
        reqheaders: { Authorization: "Bearer access-token" },
      })
      .reply(404, undefined);

    const apiRes = await emailExists("access-token", defaultParams);
    expect(apiRes).toBe(false);

    expect(nockCredentials.isDone()).toBe(true);
  });

  it("returns unauthorized", async () => {
    const nockCredentials = nockAPI
      .get(`/credentials/email?email=${defaultParams.email}`, undefined, {
        reqheaders: { Authorization: "Bearer access-token" },
      })
      .reply(401, undefined);

    const apiRes = await emailExists("access-token", defaultParams).catch((e) => e);
    expect(isUnauthorizedError(apiRes)).toBe(true);
    expect(nockCredentials.isDone()).toBe(true);
  });

  it("returns forbidden", async () => {
    const nockCredentials = nockAPI
      .get(`/credentials/email?email=${defaultParams.email}`, undefined, {
        reqheaders: { Authorization: "Bearer access-token" },
      })
      .reply(403, undefined);

    const apiRes = await emailExists("access-token", defaultParams).catch((e) => e);
    expect(isForbiddenError(apiRes)).toBe(true);
    expect(nockCredentials.isDone()).toBe(true);
  });

  it("returns internal", async () => {
    const nockCredentials = nockAPI
      .get(`/credentials/email?email=${defaultParams.email}`, undefined, {
        reqheaders: { Authorization: "Bearer access-token" },
      })
      .reply(501, "crash");

    const apiRes = await emailExists("access-token", defaultParams).catch((e) => e);
    expect(isInternalError(apiRes)).toBe(true);
    expect(nockCredentials.isDone()).toBe(true);
  });
});

describe("update email", () => {
  let nockAPI: nock.Scope;

  const defautlForm: z.infer<typeof UpdateEmailForm> = {
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

    const nockCredentials = nockAPI
      .patch("/credentials/email", defautlForm, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(200, res);

    const apiRes = await updateEmail("access-token", defautlForm);
    expect(apiRes).toEqual("user@email.com");

    expect(nockCredentials.isDone()).toBe(true);
  });

  it("returns unauthorized", async () => {
    const nockCredentials = nockAPI
      .patch("/credentials/email", defautlForm, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(401, undefined);

    const apiRes = await updateEmail("access-token", defautlForm).catch((e) => e);
    expect(isUnauthorizedError(apiRes)).toBe(true);
    expect(nockCredentials.isDone()).toBe(true);
  });

  it("returns forbidden", async () => {
    const nockCredentials = nockAPI
      .patch("/credentials/email", defautlForm, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(403, undefined);

    const apiRes = await updateEmail("access-token", defautlForm).catch((e) => e);
    expect(isForbiddenError(apiRes)).toBe(true);
    expect(nockCredentials.isDone()).toBe(true);
  });

  it("returns not found", async () => {
    const nockCredentials = nockAPI
      .patch("/credentials/email", defautlForm, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(404, undefined);

    const apiRes = await updateEmail("access-token", defautlForm).catch((e) => e);
    expect(isUserNotFoundError(apiRes)).toBe(true);
    expect(nockCredentials.isDone()).toBe(true);
  });

  it("returns conflict", async () => {
    const nockCredentials = nockAPI
      .patch("/credentials/email", defautlForm, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(410, undefined);

    const apiRes = await updateEmail("access-token", defautlForm).catch((e) => e);
    expect(isEmailTakenError(apiRes)).toBe(true);
    expect(nockCredentials.isDone()).toBe(true);
  });

  it("returns internal", async () => {
    const nockCredentials = nockAPI
      .patch("/credentials/email", defautlForm, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(501, "crash");

    const apiRes = await updateEmail("access-token", defautlForm).catch((e) => e);
    expect(isInternalError(apiRes)).toBe(true);
    expect(nockCredentials.isDone()).toBe(true);
  });
});

describe("update password", () => {
  let nockAPI: nock.Scope;

  const defautlForm: z.infer<typeof UpdatePasswordForm> = {
    password: "new-password",
    currentPassword: "current-password",
  };

  genericSetup({
    setNockAPI: (newScope) => {
      nockAPI = newScope;
    },
  });

  it("returns successful response", async () => {
    const nockCredentials = nockAPI
      .patch("/credentials/password", defautlForm, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(201, undefined);

    await updatePassword("access-token", defautlForm);

    expect(nockCredentials.isDone()).toBe(true);
  });

  it("returns unauthorized", async () => {
    const nockCredentials = nockAPI
      .patch("/credentials/password", defautlForm, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(401, undefined);

    const apiRes = await updatePassword("access-token", defautlForm).catch((e) => e);
    expect(isUnauthorizedError(apiRes)).toBe(true);
    expect(nockCredentials.isDone()).toBe(true);
  });

  it("returns forbidden", async () => {
    const nockCredentials = nockAPI
      .patch("/credentials/password", defautlForm, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(403, undefined);

    const apiRes = await updatePassword("access-token", defautlForm).catch((e) => e);
    expect(isForbiddenError(apiRes)).toBe(true);
    expect(nockCredentials.isDone()).toBe(true);
  });

  it("returns internal", async () => {
    const nockCredentials = nockAPI
      .patch("/credentials/password", defautlForm, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(501, "crash");

    const apiRes = await updatePassword("access-token", defautlForm).catch((e) => e);
    expect(isInternalError(apiRes)).toBe(true);
    expect(nockCredentials.isDone()).toBe(true);
  });
});

describe("update role", () => {
  let nockAPI: nock.Scope;

  const defautlForm: z.infer<typeof UpdateRoleForm> = {
    userID: "user-id",
    role: CredentialsRoleEnum.Admin,
  };

  genericSetup({
    setNockAPI: (newScope) => {
      nockAPI = newScope;
    },
  });

  it("returns successful response", async () => {
    const res: z.infer<typeof User> = {
      id: "00000000-0000-0000-0000-000000000001",
      email: "user@email.com",
      roles: CredentialsRoleEnum.Admin,
      createdAt: new Date("2025-05-05T10:56:25.468Z"),
      updatedAt: new Date("2025-05-05T10:56:25.468Z"),
    };
    const rawRes = {
      id: "00000000-0000-0000-0000-000000000001",
      email: "user@email.com",
      roles: CredentialsRoleEnum.Admin,
      createdAt: "2025-05-05T10:56:25.468Z",
      updatedAt: "2025-05-05T10:56:25.468Z",
    };

    const nockCredentials = nockAPI
      .patch("/credentials/role", defautlForm, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(200, rawRes);

    const apiRes = await updateRole("access-token", defautlForm);
    expect(apiRes).toEqual(res);

    expect(nockCredentials.isDone()).toBe(true);
  });

  it("returns unauthorized", async () => {
    const nockCredentials = nockAPI
      .patch("/credentials/role", defautlForm, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(401, undefined);

    const apiRes = await updateRole("access-token", defautlForm).catch((e) => e);
    expect(isUnauthorizedError(apiRes)).toBe(true);
    expect(nockCredentials.isDone()).toBe(true);
  });

  it("returns forbidden", async () => {
    const nockCredentials = nockAPI
      .patch("/credentials/role", defautlForm, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(403, undefined);

    const apiRes = await updateRole("access-token", defautlForm).catch((e) => e);
    expect(isForbiddenError(apiRes)).toBe(true);
    expect(nockCredentials.isDone()).toBe(true);
  });

  it("returns not found", async () => {
    const nockCredentials = nockAPI
      .patch("/credentials/role", defautlForm, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(404, undefined);

    const apiRes = await updateRole("access-token", defautlForm).catch((e) => e);
    expect(isUserNotFoundError(apiRes)).toBe(true);
    expect(nockCredentials.isDone()).toBe(true);
  });

  it("returns unprocessable entity", async () => {
    const nockCredentials = nockAPI
      .patch("/credentials/role", defautlForm, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(422, undefined);

    const apiRes = await updateRole("access-token", defautlForm).catch((e) => e);
    expect(isValidationError(apiRes)).toBe(true);
    expect(nockCredentials.isDone()).toBe(true);
  });

  it("returns internal", async () => {
    const nockCredentials = nockAPI
      .patch("/credentials/role", defautlForm, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(501, "crash");

    const apiRes = await updateRole("access-token", defautlForm).catch((e) => e);
    expect(isInternalError(apiRes)).toBe(true);
    expect(nockCredentials.isDone()).toBe(true);
  });
});

describe("reset password", () => {
  let nockAPI: nock.Scope;

  const defautlForm: z.infer<typeof ResetPasswordForm> = {
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
    const nockCredentials = nockAPI
      .patch("/credentials/password/reset", defautlForm, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(201, undefined);

    await resetPassword("access-token", defautlForm);

    expect(nockCredentials.isDone()).toBe(true);
  });

  it("returns unauthorized", async () => {
    const nockCredentials = nockAPI
      .patch("/credentials/password/reset", defautlForm, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(401, undefined);

    const apiRes = await resetPassword("access-token", defautlForm).catch((e) => e);
    expect(isUnauthorizedError(apiRes)).toBe(true);
    expect(nockCredentials.isDone()).toBe(true);
  });

  it("returns forbidden", async () => {
    const nockCredentials = nockAPI
      .patch("/credentials/password/reset", defautlForm, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(403, undefined);

    const apiRes = await resetPassword("access-token", defautlForm).catch((e) => e);
    expect(isForbiddenError(apiRes)).toBe(true);
    expect(nockCredentials.isDone()).toBe(true);
  });

  it("returns internal", async () => {
    const nockCredentials = nockAPI
      .patch("/credentials/password/reset", defautlForm, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(501, "crash");

    const apiRes = await resetPassword("access-token", defautlForm).catch((e) => e);
    expect(isInternalError(apiRes)).toBe(true);
    expect(nockCredentials.isDone()).toBe(true);
  });
});
