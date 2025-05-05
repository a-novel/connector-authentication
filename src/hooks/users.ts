import { InternalError, listUsers, UnauthorizedError } from "@/api";
import { QueryAPI } from "@/hooks/common";

import { useQuery } from "@tanstack/react-query";

const BASE_PARAMS = ["authentication service", "users"] as const;

const listUsersKey = (...params: Parameters<typeof listUsers>) => [
  ...BASE_PARAMS,
  "list",
  params[1],
  { token: params[0] },
];

export const ListUsers: QueryAPI<
  Parameters<typeof listUsers>,
  Awaited<ReturnType<typeof listUsers>>,
  UnauthorizedError | InternalError
> = {
  key: listUsersKey,
  useAPI: (...params) =>
    useQuery({
      queryKey: listUsersKey(...params),
      queryFn: () => listUsers(...params),
      enabled: !!params[0],
    }),
};
