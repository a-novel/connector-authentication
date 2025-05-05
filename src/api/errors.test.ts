import { newErrorResponseMessage } from "./errors";

import { describe, it, expect } from "vitest";

describe("newErrorResponseMessage", () => {
  it("should return a message with the status code and response body", async () => {
    const response = {
      status: 404,
      body: new ReadableStream<Uint8Array>(),
      text: async () => "Not found",
    } as Response;

    const message = await newErrorResponseMessage("Error", response);
    expect(message).toEqual("Error: [404] Not found");
  });

  it("should return a message with the status code and an error message without body", async () => {
    const response = {
      status: 500,
      text: async () => "Internal server error",
    } as Response;

    const message = await newErrorResponseMessage("Error", response);
    expect(message).toEqual("Error: unexpected status code 500");
  });
});
