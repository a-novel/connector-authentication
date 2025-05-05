import { apiPath, withAuthHeaders, withDefaultHeaders } from "./common";

import { describe, it, expect } from "vitest";

describe("auth path", () => {
  it("should have api env defined", () => {
    expect(import.meta.env.VITE_AUTH_API).toBeDefined();
    expect(import.meta.env.VITE_AUTH_API).toMatch(new RegExp(`^http://`));
  });

  it("should append the path to the base defined in environment", () => {
    expect(apiPath("/session").toString()).toEqual(`${import.meta.env.VITE_AUTH_API}/session`);
    expect(apiPath("/session?foo").toString()).toEqual(`${import.meta.env.VITE_AUTH_API}/session?foo`);
  });

  it("should append query parameters", () => {
    const params = new URLSearchParams();
    params.append("foo", "bar");
    params.append("baz", "qux");
    params.append("baz", "quux");

    expect(apiPath("", params)).toEqual(new URL(`${import.meta.env.VITE_AUTH_API}?foo=bar&baz=qux&baz=quux`));
  });
});

describe("headers", () => {
  describe("default headers", () => {
    it("should return the default headers", () => {
      expect(withDefaultHeaders()).toEqual({
        headers: { "Content-Type": "application/json" },
      });
    });

    it("should merge custom headers", () => {
      expect(withDefaultHeaders({ method: "PUT" })).toEqual({
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      expect(withDefaultHeaders({ method: "PUT", headers: { "X-custom": "foo" } })).toEqual({
        method: "PUT",
        headers: { "Content-Type": "application/json", "X-custom": "foo" },
      });
    });

    it("should not override conflicting values", () => {
      expect(withDefaultHeaders({ method: "PUT", headers: { "Content-Type": "text/plain" } })).toEqual({
        method: "PUT",
        headers: { "Content-Type": "text/plain" },
      });
    });
  });

  describe("auth headers", () => {
    it("should return the default headers", () => {
      expect(withAuthHeaders("access-token")).toEqual({
        headers: { "Content-Type": "application/json", Authorization: "Bearer access-token" },
      });
    });

    it("should merge custom headers", () => {
      expect(withAuthHeaders("access-token", { method: "PUT" })).toEqual({
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: "Bearer access-token" },
      });

      expect(withAuthHeaders("access-token", { method: "PUT", headers: { "X-custom": "foo" } })).toEqual({
        method: "PUT",
        headers: { "Content-Type": "application/json", "X-custom": "foo", Authorization: "Bearer access-token" },
      });
    });

    it("should not override conflicting values", () => {
      expect(withAuthHeaders("access-token", { method: "PUT", headers: { Authorization: "foo" } })).toEqual({
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: "foo" },
      });
    });
  });
});
