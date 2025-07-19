import { MockQueryClient } from "../../__test__/mocks/query_client";
import { server } from "../../__test__/utils/setup";
import { QueryWrapper } from "../../__test__/utils/wrapper";
import { LangEnum, RequestEmailUpdateForm, RequestPasswordResetForm, RequestRegistrationForm } from "../api";
import { RequestEmailUpdate, RequestPasswordReset, RequestRegister } from "./index";

import { http } from "@a-novel/nodelib/msw";

import { QueryClient } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { HttpResponse } from "msw";
import { describe, it } from "vitest";
import { z } from "zod";

describe("request registration", () => {
  const defaultForm: z.infer<typeof RequestRegistrationForm> = {
    email: "user@email.com",
    lang: LangEnum.Fr,
  };

  it("returns successful response", async () => {
    const queryClient = new QueryClient(MockQueryClient);

    server.use(
      http
        .put("http://localhost:3000/short-code/register")
        .headers(new Headers({ Authorization: "Bearer access-token" }), HttpResponse.error())
        .bodyJSON(defaultForm, HttpResponse.error())
        .resolve(() => HttpResponse.json(undefined, { status: 200 }))
    );

    const hook = renderHook((accessToken) => RequestRegister.useAPI(accessToken), {
      initialProps: "access-token",
      wrapper: QueryWrapper(queryClient),
    });

    await act(async () => {
      await hook.result.current.mutateAsync(defaultForm);
    });
  });
});

describe("request email update", () => {
  const defaultForm: z.infer<typeof RequestEmailUpdateForm> = {
    email: "user@email.com",
    lang: LangEnum.Fr,
  };

  it("returns successful response", async () => {
    const queryClient = new QueryClient(MockQueryClient);

    server.use(
      http
        .put("http://localhost:3000/short-code/update-email")
        .headers(new Headers({ Authorization: "Bearer access-token" }), HttpResponse.error())
        .bodyJSON(defaultForm, HttpResponse.error())
        .resolve(() => HttpResponse.json(undefined, { status: 200 }))
    );

    const hook = renderHook((accessToken) => RequestEmailUpdate.useAPI(accessToken), {
      initialProps: "access-token",
      wrapper: QueryWrapper(queryClient),
    });

    await act(async () => {
      await hook.result.current.mutateAsync(defaultForm);
    });
  });
});

describe("request password reset", () => {
  const defaultForm: z.infer<typeof RequestPasswordResetForm> = {
    email: "user@email.com",
    lang: LangEnum.Fr,
  };

  it("returns successful response", async () => {
    const queryClient = new QueryClient(MockQueryClient);

    server.use(
      http
        .put("http://localhost:3000/short-code/update-password")
        .headers(new Headers({ Authorization: "Bearer access-token" }), HttpResponse.error())
        .bodyJSON(defaultForm, HttpResponse.error())
        .resolve(() => HttpResponse.json(undefined, { status: 200 }))
    );

    const hook = renderHook((accessToken) => RequestPasswordReset.useAPI(accessToken), {
      initialProps: "access-token",
      wrapper: QueryWrapper(queryClient),
    });

    await act(async () => {
      await hook.result.current.mutateAsync(defaultForm);
    });
  });
});
