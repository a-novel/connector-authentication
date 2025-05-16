import {
  checkSession,
  createAnonymousSession,
  createSession,
  ForbiddenError,
  InternalError,
  isInternalError,
  LoginForm,
  newRefreshToken,
  RefreshAccessTokenParams,
  refreshSession,
  UnauthorizedError,
  UserNotFoundError,
} from "../api";
import { MutationAPI, QueryAPI } from "./common";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

const BASE_PARAMS = ["authentication service", "session"] as const;

const checkSessionQueryKey = (...params: Parameters<typeof checkSession>) => [
  ...BASE_PARAMS,
  "check session",
  { token: params[0] },
];

export const CheckSession: QueryAPI<
  Parameters<typeof checkSession>,
  Awaited<ReturnType<typeof checkSession>>,
  UnauthorizedError | InternalError
> = {
  key: checkSessionQueryKey,
  useAPI: (...params) =>
    useQuery({
      queryKey: checkSessionQueryKey(...params),
      queryFn: () => checkSession(...params),
      enabled: !!params[0],
      retry: (failureCount, error) => failureCount < 3 && isInternalError(error),
      retryDelay: (failureCount) => failureCount * 500,
    }),
};

const createSessionMutationKey = [...BASE_PARAMS, "create session"];

export const CreateSession: MutationAPI<
  [],
  Awaited<ReturnType<typeof createSession>>,
  ForbiddenError | UserNotFoundError | InternalError,
  z.infer<typeof LoginForm>
> = {
  key: createSessionMutationKey,
  useAPI: () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (form) => createSession(form),
      mutationKey: createSessionMutationKey,
      onSuccess: async () => {
        // Refresh session status on success.
        await queryClient.invalidateQueries({ queryKey: [...BASE_PARAMS, "check session"] });
      },
    });
  },
};

const createAnonymousSessionMutationKey = [...BASE_PARAMS, "create anonymous session"];

export const CreateAnonymousSession: MutationAPI<
  [],
  Awaited<ReturnType<typeof createAnonymousSession>>,
  InternalError,
  void
> = {
  key: createAnonymousSessionMutationKey,
  useAPI: () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: createAnonymousSession,
      mutationKey: createAnonymousSessionMutationKey,
      onSuccess: async () => {
        // Refresh session status on success.
        await queryClient.invalidateQueries({ queryKey: [...BASE_PARAMS, "check session"] });
      },
    });
  },
};

const refreshSessionMutationKey = [...BASE_PARAMS, "refresh session"];

export const RefreshSession: MutationAPI<
  [],
  Awaited<ReturnType<typeof refreshSession>>,
  UnauthorizedError | InternalError,
  z.infer<typeof RefreshAccessTokenParams>
> = {
  key: refreshSessionMutationKey,
  useAPI: () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (params) => refreshSession(params),
      mutationKey: refreshSessionMutationKey,
      onSuccess: async () => {
        // Refresh session status on success.
        await queryClient.invalidateQueries({ queryKey: [...BASE_PARAMS, "check session"] });
      },
    });
  },
};

const newRefreshTokenMutationKey = [...BASE_PARAMS, "new refresh token"];

export const NewRefreshToken: MutationAPI<
  [accessToken: string],
  Awaited<ReturnType<typeof newRefreshToken>>,
  UnauthorizedError | ForbiddenError | InternalError,
  void
> = {
  key: newRefreshTokenMutationKey,
  useAPI: (accessToken) =>
    useMutation({
      mutationFn: () => newRefreshToken(accessToken),
      mutationKey: newRefreshTokenMutationKey,
    }),
};
