import { genericSetup } from "#/utils/setup";

import {
  LangEnum,
  RequestEmailUpdateForm,
  RequestPasswordResetForm,
  RequestRegistrationForm,
  isInternalError,
  isUnauthorizedError,
  requestEmailUpdate,
  requestPasswordReset,
  requestRegistration,
} from "@/api";

import nock from "nock";
import { describe, expect, it } from "vitest";
import { z } from "zod";

describe("request registration", () => {
  let nockAPI: nock.Scope;

  const defaultForm: z.infer<typeof RequestRegistrationForm> = {
    email: "user@email.com",
    lang: LangEnum.Fr,
  };

  genericSetup({
    setNockAPI: (newScope) => {
      nockAPI = newScope;
    },
  });

  it("returns successful response", async () => {
    const nockShortCode = nockAPI
      .put("/short-code/register", defaultForm, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(200);

    await requestRegistration("access-token", defaultForm);

    expect(nockShortCode.isDone()).toBe(true);
  });

  it("returns unauthorized", async () => {
    const nockShortCode = nockAPI
      .put("/short-code/register", defaultForm, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(401, undefined);

    const apiRes = await requestRegistration("access-token", defaultForm).catch((e) => e);
    expect(isUnauthorizedError(apiRes)).toBe(true);
    expect(nockShortCode.isDone()).toBe(true);
  });

  it("returns internal", async () => {
    const nockShortCode = nockAPI
      .put("/short-code/register", defaultForm, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(501, "crash");

    const apiRes = await requestRegistration("access-token", defaultForm).catch((e) => e);
    expect(isInternalError(apiRes)).toBe(true);
    expect(nockShortCode.isDone()).toBe(true);
  });
});

describe("request email update", () => {
  let nockAPI: nock.Scope;

  const defaultForm: z.infer<typeof RequestEmailUpdateForm> = {
    email: "user@email.com",
    lang: LangEnum.Fr,
  };

  genericSetup({
    setNockAPI: (newScope) => {
      nockAPI = newScope;
    },
  });

  it("returns successful response", async () => {
    const nockShortCode = nockAPI
      .put("/short-code/update-email", defaultForm, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(200);

    await requestEmailUpdate("access-token", defaultForm);

    expect(nockShortCode.isDone()).toBe(true);
  });

  it("returns unauthorized", async () => {
    const nockShortCode = nockAPI
      .put("/short-code/update-email", defaultForm, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(401, undefined);

    const apiRes = await requestEmailUpdate("access-token", defaultForm).catch((e) => e);
    expect(isUnauthorizedError(apiRes)).toBe(true);
    expect(nockShortCode.isDone()).toBe(true);
  });

  it("returns internal", async () => {
    const nockShortCode = nockAPI
      .put("/short-code/update-email", defaultForm, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(501, "crash");

    const apiRes = await requestEmailUpdate("access-token", defaultForm).catch((e) => e);
    expect(isInternalError(apiRes)).toBe(true);
    expect(nockShortCode.isDone()).toBe(true);
  });
});

describe("request password reset", () => {
  let nockAPI: nock.Scope;

  const defaultForm: z.infer<typeof RequestPasswordResetForm> = {
    email: "user@email.com",
    lang: LangEnum.Fr,
  };

  genericSetup({
    setNockAPI: (newScope) => {
      nockAPI = newScope;
    },
  });

  it("returns successful response", async () => {
    const nockShortCode = nockAPI
      .put("/short-code/update-password", defaultForm, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(200);

    await requestPasswordReset("access-token", defaultForm);

    expect(nockShortCode.isDone()).toBe(true);
  });

  it("returns unauthorized", async () => {
    const nockShortCode = nockAPI
      .put("/short-code/update-password", defaultForm, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(401, undefined);

    const apiRes = await requestPasswordReset("access-token", defaultForm).catch((e) => e);
    expect(isUnauthorizedError(apiRes)).toBe(true);
    expect(nockShortCode.isDone()).toBe(true);
  });

  it("returns internal", async () => {
    const nockShortCode = nockAPI
      .put("/short-code/update-password", defaultForm, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(501, "crash");

    const apiRes = await requestPasswordReset("access-token", defaultForm).catch((e) => e);
    expect(isInternalError(apiRes)).toBe(true);
    expect(nockShortCode.isDone()).toBe(true);
  });
});
