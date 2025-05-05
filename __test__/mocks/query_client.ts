import { QueryClientConfig } from "@tanstack/react-query";

export const MockQueryClient: QueryClientConfig = {
  defaultOptions: {
    queries: {
      retry: false,
      // Setting the stale time avoid refreshes, and allow use to have more control
      // over which query we expect to be made.
      staleTime: Infinity,
    },
  },
};

export const MockReplyHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-credentials": "true",
  "access-control-allow-headers": "Authorization,ACCEPT_LANGUAGE,traceparent",
};
