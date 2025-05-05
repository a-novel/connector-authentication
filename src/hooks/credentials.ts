import {
  createUser,
  emailExists,
  EmailTakenError,
  ForbiddenError,
  InternalError,
  isInternalError,
  RegisterForm,
  resetPassword,
  ResetPasswordForm,
  UnauthorizedError,
  updateEmail,
  UpdateEmailForm,
  updatePassword,
  UpdatePasswordForm,
  updateRole,
  UpdateRoleForm,
  UserNotFoundError,
  ValidationError,
} from "@/api";
import { MutationAPI, QueryAPI } from "@/hooks/common";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

const BASE_PARAMS = ["authentication service", "credentials"] as const;

const createUserMutationKey = [...BASE_PARAMS, "create"];

export const CreateUser: MutationAPI<
  [accessToken: string],
  Awaited<ReturnType<typeof createUser>>,
  UnauthorizedError | ForbiddenError | EmailTakenError | InternalError,
  z.infer<typeof RegisterForm>
> = {
  key: createUserMutationKey,
  useAPI: (accessToken: string) => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (form) => createUser(accessToken, form),
      mutationKey: createUserMutationKey,
      onSuccess: async (_, form) => {
        // A new email has been claimed, update the query to reflect that.
        await queryClient.invalidateQueries({ queryKey: [...BASE_PARAMS, "email-exists", { email: form.email }] });
      },
    });
  },
};

const emailExistsQueryKey = (...params: Parameters<typeof emailExists>) => [
  ...BASE_PARAMS,
  "email-exists",
  params[1],
  { token: params[0] },
];

export const EmailExists: QueryAPI<
  Parameters<typeof emailExists>,
  Awaited<ReturnType<typeof emailExists>>,
  UnauthorizedError | ForbiddenError | InternalError
> = {
  key: emailExistsQueryKey,
  useAPI: (...params) =>
    useQuery({
      queryFn: () => emailExists(...params),
      queryKey: emailExistsQueryKey(...params),
      retry: (_, error) => isInternalError(error),
      enabled: !!params[0] && !!params[1].email,
    }),
};

const updateEmailMutationKey = [...BASE_PARAMS, "update-email"];

export const UpdateEmail: MutationAPI<
  [accessToken: string],
  Awaited<ReturnType<typeof updateEmail>>,
  UnauthorizedError | ForbiddenError | UserNotFoundError | EmailTakenError | InternalError,
  z.infer<typeof UpdateEmailForm>
> = {
  key: updateEmailMutationKey,
  useAPI: (accessToken: string) => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (form) => updateEmail(accessToken, form),
      mutationKey: updateEmailMutationKey,
      onSuccess: async () => {
        // A new email has been added and the old one freed. Since we don't have access to the old email here, lets
        // just reset all email-exists queries.
        await queryClient.invalidateQueries({ queryKey: [...BASE_PARAMS, "email-exists"] });
      },
    });
  },
};

const updatePasswordMutationKey = [...BASE_PARAMS, "update-password"];

export const UpdatePassword: MutationAPI<
  [accessToken: string],
  Awaited<ReturnType<typeof updatePassword>>,
  UnauthorizedError | ForbiddenError | InternalError,
  z.infer<typeof UpdatePasswordForm>
> = {
  key: updatePasswordMutationKey,
  useAPI: (accessToken: string) =>
    useMutation({
      mutationFn: (form) => updatePassword(accessToken, form),
      mutationKey: updatePasswordMutationKey,
    }),
};

const updateRoleMutationKey = [...BASE_PARAMS, "update-role"];

export const UpdateRole: MutationAPI<
  [accessToken: string],
  Awaited<ReturnType<typeof updateRole>>,
  UnauthorizedError | ForbiddenError | UserNotFoundError | ValidationError | InternalError,
  z.infer<typeof UpdateRoleForm>
> = {
  key: updateRoleMutationKey,
  useAPI: (accessToken: string) =>
    useMutation({
      mutationFn: (form) => updateRole(accessToken, form),
      mutationKey: updateRoleMutationKey,
    }),
};

const resetPasswordMutationKey = [...BASE_PARAMS, "reset-password"];

export const ResetPassword: MutationAPI<
  [accessToken: string],
  Awaited<ReturnType<typeof resetPassword>>,
  UnauthorizedError | ForbiddenError | InternalError,
  z.infer<typeof ResetPasswordForm>
> = {
  key: resetPasswordMutationKey,
  useAPI: (accessToken: string) =>
    useMutation({
      mutationFn: (form) => resetPassword(accessToken, form),
      mutationKey: resetPasswordMutationKey,
    }),
};
