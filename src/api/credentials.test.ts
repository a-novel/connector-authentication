import { genericSetup } from "../../__test__/utils/setup";
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
} from "./index";

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

    const nockCredentials = nockAPI
      .put("/credentials", defaultForm, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(200, res);

    const apiRes = await createUser("access-token", defaultForm);
    expect(apiRes).toEqual(res);

    nockCredentials.done();
  });

  it("returns unauthorized", async () => {
    const nockCredentials = nockAPI
      .put("/credentials", defaultForm, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(401, undefined);

    const apiRes = await createUser("access-token", defaultForm).catch((e) => e);
    expect(isUnauthorizedError(apiRes)).toBe(true);
    nockCredentials.done();
  });

  it("returns forbidden", async () => {
    const nockCredentials = nockAPI
      .put("/credentials", defaultForm, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(403, undefined);

    const apiRes = await createUser("access-token", defaultForm).catch((e) => e);
    expect(isForbiddenError(apiRes)).toBe(true);
    nockCredentials.done();
  });

  it("returns conflict", async () => {
    const nockCredentials = nockAPI
      .put("/credentials", defaultForm, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(410, undefined);

    const apiRes = await createUser("access-token", defaultForm).catch((e) => e);
    expect(isEmailTakenError(apiRes)).toBe(true);
    nockCredentials.done();
  });

  it("returns internal", async () => {
    const nockCredentials = nockAPI
      .put("/credentials", defaultForm, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(501, "crash");

    const apiRes = await createUser("access-token", defaultForm).catch((e) => e);
    expect(isInternalError(apiRes)).toBe(true);
    nockCredentials.done();
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

    nockCredentials.done();
  });

  it("returns not found", async () => {
    const nockCredentials = nockAPI
      .get(`/credentials/email?email=${defaultParams.email}`, undefined, {
        reqheaders: { Authorization: "Bearer access-token" },
      })
      .reply(404, undefined);

    const apiRes = await emailExists("access-token", defaultParams);
    expect(apiRes).toBe(false);

    nockCredentials.done();
  });

  it("returns unauthorized", async () => {
    const nockCredentials = nockAPI
      .get(`/credentials/email?email=${defaultParams.email}`, undefined, {
        reqheaders: { Authorization: "Bearer access-token" },
      })
      .reply(401, undefined);

    const apiRes = await emailExists("access-token", defaultParams).catch((e) => e);
    expect(isUnauthorizedError(apiRes)).toBe(true);
    nockCredentials.done();
  });

  it("returns forbidden", async () => {
    const nockCredentials = nockAPI
      .get(`/credentials/email?email=${defaultParams.email}`, undefined, {
        reqheaders: { Authorization: "Bearer access-token" },
      })
      .reply(403, undefined);

    const apiRes = await emailExists("access-token", defaultParams).catch((e) => e);
    expect(isForbiddenError(apiRes)).toBe(true);
    nockCredentials.done();
  });

  it("returns internal", async () => {
    const nockCredentials = nockAPI
      .get(`/credentials/email?email=${defaultParams.email}`, undefined, {
        reqheaders: { Authorization: "Bearer access-token" },
      })
      .reply(501, "crash");

    const apiRes = await emailExists("access-token", defaultParams).catch((e) => e);
    expect(isInternalError(apiRes)).toBe(true);
    nockCredentials.done();
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

    const nockCredentials = nockAPI
      .patch("/credentials/email", defaultForm, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(200, res);

    const apiRes = await updateEmail("access-token", defaultForm);
    expect(apiRes).toEqual("user@email.com");

    nockCredentials.done();
  });

  it("returns unauthorized", async () => {
    const nockCredentials = nockAPI
      .patch("/credentials/email", defaultForm, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(401, undefined);

    const apiRes = await updateEmail("access-token", defaultForm).catch((e) => e);
    expect(isUnauthorizedError(apiRes)).toBe(true);
    nockCredentials.done();
  });

  it("returns forbidden", async () => {
    const nockCredentials = nockAPI
      .patch("/credentials/email", defaultForm, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(403, undefined);

    const apiRes = await updateEmail("access-token", defaultForm).catch((e) => e);
    expect(isForbiddenError(apiRes)).toBe(true);
    nockCredentials.done();
  });

  it("returns not found", async () => {
    const nockCredentials = nockAPI
      .patch("/credentials/email", defaultForm, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(404, undefined);

    const apiRes = await updateEmail("access-token", defaultForm).catch((e) => e);
    expect(isUserNotFoundError(apiRes)).toBe(true);
    nockCredentials.done();
  });

  it("returns conflict", async () => {
    const nockCredentials = nockAPI
      .patch("/credentials/email", defaultForm, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(410, undefined);

    const apiRes = await updateEmail("access-token", defaultForm).catch((e) => e);
    expect(isEmailTakenError(apiRes)).toBe(true);
    nockCredentials.done();
  });

  it("returns internal", async () => {
    const nockCredentials = nockAPI
      .patch("/credentials/email", defaultForm, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(501, "crash");

    const apiRes = await updateEmail("access-token", defaultForm).catch((e) => e);
    expect(isInternalError(apiRes)).toBe(true);
    nockCredentials.done();
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
    const nockCredentials = nockAPI
      .patch("/credentials/password", defaultForm, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(201, undefined);

    await updatePassword("access-token", defaultForm);

    nockCredentials.done();
  });

  it("returns unauthorized", async () => {
    const nockCredentials = nockAPI
      .patch("/credentials/password", defaultForm, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(401, undefined);

    const apiRes = await updatePassword("access-token", defaultForm).catch((e) => e);
    expect(isUnauthorizedError(apiRes)).toBe(true);
    nockCredentials.done();
  });

  it("returns forbidden", async () => {
    const nockCredentials = nockAPI
      .patch("/credentials/password", defaultForm, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(403, undefined);

    const apiRes = await updatePassword("access-token", defaultForm).catch((e) => e);
    expect(isForbiddenError(apiRes)).toBe(true);
    nockCredentials.done();
  });

  it("returns internal", async () => {
    const nockCredentials = nockAPI
      .patch("/credentials/password", defaultForm, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(501, "crash");

    const apiRes = await updatePassword("access-token", defaultForm).catch((e) => e);
    expect(isInternalError(apiRes)).toBe(true);
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

    const apiRes = await updateRole("access-token", defaultForm);
    expect(apiRes).toEqual(res);

    nockCredentials.done();
  });

  it("returns unauthorized", async () => {
    const nockCredentials = nockAPI
      .patch("/credentials/role", defaultForm, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(401, undefined);

    const apiRes = await updateRole("access-token", defaultForm).catch((e) => e);
    expect(isUnauthorizedError(apiRes)).toBe(true);
    nockCredentials.done();
  });

  it("returns forbidden", async () => {
    const nockCredentials = nockAPI
      .patch("/credentials/role", defaultForm, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(403, undefined);

    const apiRes = await updateRole("access-token", defaultForm).catch((e) => e);
    expect(isForbiddenError(apiRes)).toBe(true);
    nockCredentials.done();
  });

  it("returns not found", async () => {
    const nockCredentials = nockAPI
      .patch("/credentials/role", defaultForm, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(404, undefined);

    const apiRes = await updateRole("access-token", defaultForm).catch((e) => e);
    expect(isUserNotFoundError(apiRes)).toBe(true);
    nockCredentials.done();
  });

  it("returns unprocessable entity", async () => {
    const nockCredentials = nockAPI
      .patch("/credentials/role", defaultForm, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(422, undefined);

    const apiRes = await updateRole("access-token", defaultForm).catch((e) => e);
    expect(isValidationError(apiRes)).toBe(true);
    nockCredentials.done();
  });

  it("returns internal", async () => {
    const nockCredentials = nockAPI
      .patch("/credentials/role", defaultForm, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(501, "crash");

    const apiRes = await updateRole("access-token", defaultForm).catch((e) => e);
    expect(isInternalError(apiRes)).toBe(true);
    nockCredentials.done();
  });
});

describe("reset password", () => {
  let nockAPI: nock.Scope;

  const defaultForm: z.infer<typeof ResetPasswordForm> = {
    userID: "29f71c01-5ae1-4b01-b729-e17488538e15",
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
      .patch("/credentials/password/reset", defaultForm, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(201, undefined);

    await resetPassword("access-token", defaultForm);

    nockCredentials.done();
  });

  it("returns unauthorized", async () => {
    const nockCredentials = nockAPI
      .patch("/credentials/password/reset", defaultForm, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(401, undefined);

    const apiRes = await resetPassword("access-token", defaultForm).catch((e) => e);
    expect(isUnauthorizedError(apiRes)).toBe(true);
    nockCredentials.done();
  });

  it("returns forbidden", async () => {
    const nockCredentials = nockAPI
      .patch("/credentials/password/reset", defaultForm, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(403, undefined);

    const apiRes = await resetPassword("access-token", defaultForm).catch((e) => e);
    expect(isForbiddenError(apiRes)).toBe(true);
    nockCredentials.done();
  });

  it("returns internal", async () => {
    const nockCredentials = nockAPI
      .patch("/credentials/password/reset", defaultForm, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(501, "crash");

    const apiRes = await resetPassword("access-token", defaultForm).catch((e) => e);
    expect(isInternalError(apiRes)).toBe(true);
    nockCredentials.done();
  });
});
