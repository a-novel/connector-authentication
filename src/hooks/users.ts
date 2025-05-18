import {
  ForbiddenError,
  getUser,
  InternalError,
  isInternalError,
  listUsers,
  UnauthorizedError,
  UserNotFoundError,
} from "../api";
import { InfiniteQueryAPI, QueryAPI } from "./common";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

const BASE_PARAMS = ["authentication service", "users"] as const;

const listUsersKey = (...params: Parameters<typeof listUsers>) => [
  ...BASE_PARAMS,
  "list",
  params[1],
  { token: params[0] },
];

const DEFAULT_LIST_USERS_LIMIT = 10;

export const ListUsers: InfiniteQueryAPI<
  [...Parameters<typeof listUsers>, { maxPages?: number }?],
  { pages: Awaited<ReturnType<typeof listUsers>>[] },
  UnauthorizedError | InternalError
> = {
  key: listUsersKey,
  useAPI: (accessToken, params, options) =>
    useInfiniteQuery({
      queryKey: listUsersKey(accessToken, params),
      queryFn: ({ pageParam = 0 }) => listUsers(accessToken, { ...params, offset: pageParam }),
      initialPageParam: params.offset,
      getNextPageParam: (lastPage, _allPages, lastPageParam) =>
        lastPage.length > 0 ? (lastPageParam ?? 0) + lastPage.length : undefined,
      getPreviousPageParam: (_firstPage, _allPages, firstPageParam) =>
        (firstPageParam ?? 0) > 0
          ? Math.max(0, (firstPageParam ?? 0) - (params.limit ?? DEFAULT_LIST_USERS_LIMIT))
          : undefined,
      enabled: !!accessToken,
      maxPages: options?.maxPages,
    }),
};

const getUserQueryKey = (...params: Parameters<typeof getUser>) => [
  ...BASE_PARAMS,
  "list",
  params[1],
  { token: params[0] },
];

export const GetUser: QueryAPI<
  Parameters<typeof getUser>,
  Awaited<ReturnType<typeof getUser>>,
  UnauthorizedError | ForbiddenError | UserNotFoundError | InternalError
> = {
  key: getUserQueryKey,
  useAPI: (...params) =>
    useQuery({
      queryKey: getUserQueryKey(...params),
      queryFn: () => getUser(...params),
      retry: (_, error) => isInternalError(error),
      enabled: !!params[0] && !!params[1].userID,
    }),
};
