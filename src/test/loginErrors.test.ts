import { describe, expect, it } from "vitest";
import { classifyLoginError, loginErrorDetails } from "../lib/loginErrors";

describe("login error classification", () => {
  it("recognizes invalid credentials rather than treating all 400s as credentials", () => {
    expect(classifyLoginError({ status: 400, code: "invalid_credentials" })).toBe("credentials");
    expect(classifyLoginError({ status: 400, message: "Unexpected error" })).toBe("unknown");
  });
  it("separates server 5xx even when their message mentions fetch", () => {
    for (const status of [500, 502, 503, 504]) {
      expect(classifyLoginError({ status, message: "fetch failed" })).toBe("server");
    }
  });
  it("recognizes timeouts", () => {
    expect(classifyLoginError({ name: "TimeoutError", message: "timed out" })).toBe("timeout");
  });
  it("does not invent a CORS diagnosis for opaque transport failures", () => {
    expect(classifyLoginError(new TypeError("Failed to fetch"))).toBe("network");
    expect(classifyLoginError({ name: "AuthRetryableFetchError", status: 0, message: "Load failed" })).toBe("network");
  });
  it("recognizes explicit CORS and unauthorized redirect responses", () => {
    expect(classifyLoginError({ message: "CORS policy blocked this origin" })).toBe("domain");
    expect(classifyLoginError({ status: 400, message: "redirect_uri is not allowed" })).toBe("domain");
  });
  it("keeps confirmation and rate limits distinct", () => {
    expect(classifyLoginError({ code: "email_not_confirmed" })).toBe("confirmation");
    expect(classifyLoginError({ status: 429 })).toBe("rate_limit");
  });
  it("retains status and server message without copying credentials or tokens", () => {
    expect(loginErrorDetails({ status: 503, message: "Service unavailable", password: "do-not-log", access_token: "do-not-log" }))
      .toEqual({ status: 503, message: "Service unavailable", code: null, name: null });
  });
});