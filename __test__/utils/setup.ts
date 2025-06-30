import { init } from "../../src";
import { getContextValue } from "../../src/utils";
import { MockReplyHeaders } from "../mocks/query_client";

import nock from "nock";
import { afterAll, afterEach, beforeAll, beforeEach, vi } from "vitest";

export interface GenericSetupProps {
  setNockAPI?: (scope: nock.Scope) => void;
}

beforeAll(() => {
  init({ baseURL: "http://localhost:3000" });

  if (!nock.isActive()) nock.activate();

  nock.emitter.on("no match", (req) => {
    throw new Error(`Unexpected request was sent to ${req.method} ${req.path}`);
  });
});

afterAll(() => {
  nock.restore();
});

export const genericSetup = (props: GenericSetupProps) => {
  beforeEach(() => {
    // Objects are passed by reference in javascript, so this will update the actual value from the source.
    props.setNockAPI?.(nock(getContextValue("baseURL")).defaultReplyHeaders(MockReplyHeaders));
  });

  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    nock.cleanAll();
  });
};
