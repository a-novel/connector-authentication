import { ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const QueryWrapper = (queryClient: QueryClient) =>
  function InnerQueryWrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
