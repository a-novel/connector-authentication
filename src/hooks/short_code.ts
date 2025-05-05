import {
  InternalError,
  requestEmailUpdate,
  RequestEmailUpdateForm,
  requestPasswordReset,
  RequestPasswordResetForm,
  requestRegistration,
  RequestRegistrationForm,
  UnauthorizedError,
} from "@/api";
import { MutationAPI } from "@/hooks/common";

import { useMutation } from "@tanstack/react-query";
import { z } from "zod";

const BASE_PARAMS = ["authentication service", "short code"] as const;

const requestRegisterMutationKey = [...BASE_PARAMS, "request register"];

export const RequestRegister: MutationAPI<
  [accessToken: string],
  Awaited<ReturnType<typeof requestRegistration>>,
  UnauthorizedError | InternalError,
  z.infer<typeof RequestRegistrationForm>
> = {
  key: requestRegisterMutationKey,
  useAPI: (accessToken) =>
    useMutation({
      mutationFn: (form) => requestRegistration(accessToken, form),
      mutationKey: requestRegisterMutationKey,
    }),
};

const requestEmailUpdateMutationKey = [...BASE_PARAMS, "request email update"];

export const RequestEmailUpdate: MutationAPI<
  [accessToken: string],
  Awaited<ReturnType<typeof requestEmailUpdate>>,
  UnauthorizedError | InternalError,
  z.infer<typeof RequestEmailUpdateForm>
> = {
  key: requestEmailUpdateMutationKey,
  useAPI: (accessToken) =>
    useMutation({
      mutationFn: (form) => requestEmailUpdate(accessToken, form),
      mutationKey: requestEmailUpdateMutationKey,
    }),
};

const requestPasswordResetMutationKey = [...BASE_PARAMS, "request password reset"];

export const RequestPasswordReset: MutationAPI<
  [accessToken: string],
  Awaited<ReturnType<typeof requestPasswordReset>>,
  UnauthorizedError | InternalError,
  z.infer<typeof RequestPasswordResetForm>
> = {
  key: requestPasswordResetMutationKey,
  useAPI: (accessToken) =>
    useMutation({
      mutationFn: (form) => requestPasswordReset(accessToken, form),
      mutationKey: requestPasswordResetMutationKey,
    }),
};
