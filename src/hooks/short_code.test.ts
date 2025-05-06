import { MockQueryClient } from "../../__test__/mocks/query_client";
import { genericSetup } from "../../__test__/utils/setup";
import { QueryWrapper } from "../../__test__/utils/wrapper";
import { LangEnum, RequestEmailUpdateForm, RequestPasswordResetForm, RequestRegistrationForm } from "../api";
import { RequestEmailUpdate, RequestPasswordReset, RequestRegister } from "./index";

import { QueryClient } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
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
    const queryClient = new QueryClient(MockQueryClient);

    const nockShortCode = nockAPI
      .put("/short-code/register", defaultForm, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(200);

    const hook = renderHook((accessToken) => RequestRegister.useAPI(accessToken), {
      initialProps: "access-token",
      wrapper: QueryWrapper(queryClient),
    });

    await act(async () => {
      await hook.result.current.mutateAsync(defaultForm);
    });

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
    const queryClient = new QueryClient(MockQueryClient);

    const nockShortCode = nockAPI
      .put("/short-code/update-email", defaultForm, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(200);

    const hook = renderHook((accessToken) => RequestEmailUpdate.useAPI(accessToken), {
      initialProps: "access-token",
      wrapper: QueryWrapper(queryClient),
    });

    await act(async () => {
      await hook.result.current.mutateAsync(defaultForm);
    });

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
    const queryClient = new QueryClient(MockQueryClient);

    const nockShortCode = nockAPI
      .put("/short-code/update-password", defaultForm, { reqheaders: { Authorization: "Bearer access-token" } })
      .reply(200);

    const hook = renderHook((accessToken) => RequestPasswordReset.useAPI(accessToken), {
      initialProps: "access-token",
      wrapper: QueryWrapper(queryClient),
    });

    await act(async () => {
      await hook.result.current.mutateAsync(defaultForm);
    });

    expect(nockShortCode.isDone()).toBe(true);
  });
});
