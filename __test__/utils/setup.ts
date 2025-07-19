import { init } from "../../src";

import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, vi } from "vitest";

export const server = setupServer();

afterEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  server.resetHandlers();
});

beforeAll(() => {
  init({ baseURL: "http://localhost:3000" });
  server.listen({
    onUnhandledRequest: "error",
  });
});

afterAll(() => server.close());
