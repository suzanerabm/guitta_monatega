import { S3Client } from "@aws-sdk/client-s3";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

describe("paused Studio publishing route", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("returns before authorization, state storage, alerts or Meta", async () => {
    const fetchSpy = vi.fn();
    const s3Spy = vi.spyOn(S3Client.prototype, "send");
    vi.stubGlobal("fetch", fetchSpy);

    const response = await GET(new Request("https://example.com/api/cron/guitta-studio-publish"));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({ paused: true });
    expect(s3Spy).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("only leaves the paused barrier when the route flag is the exact literal true", async () => {
    const fetchSpy = vi.fn();
    const s3Spy = vi.spyOn(S3Client.prototype, "send");
    vi.stubGlobal("fetch", fetchSpy);
    vi.stubEnv("GUITTA_STUDIO_META_ROUTE_ENABLED", "TRUE");

    const stillPaused = await GET(new Request("https://example.com/api/cron/guitta-studio-publish"));
    expect(stillPaused.status).toBe(503);

    vi.stubEnv("GUITTA_STUDIO_META_ROUTE_ENABLED", "true");
    const unauthorized = await GET(new Request("https://example.com/api/cron/guitta-studio-publish"));
    expect(unauthorized.status).toBe(401);
    expect(s3Spy).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
