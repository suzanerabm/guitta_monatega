import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

const mocks = vi.hoisted(() => ({
  run: vi.fn(),
  pause: vi.fn(),
  alert: vi.fn(),
}));

vi.mock("@/lib/guitta-studio-social/scheduled-run", () => ({
  runGuittaStudioScheduledPublisher: mocks.run,
}));
vi.mock("@/lib/guitta-studio-social/state", () => ({
  pauseStudioSchedule: mocks.pause,
}));
vi.mock("@/lib/social-publishing-alerts", () => ({
  reportPublishingFailure: mocks.alert,
}));

describe("Studio scheduled publishing route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.run.mockResolvedValue({ status: "no-publication-today", calls: 0 });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("is disabled unless the cron flag is the exact literal true", async () => {
    vi.stubEnv("GUITTA_STUDIO_META_CRON_ENABLED", "TRUE");
    const response = await GET(new Request("https://example.com/api/cron/guitta-studio-scheduled-publish"));

    expect(response.status).toBe(503);
    expect(mocks.run).not.toHaveBeenCalled();
    expect(mocks.pause).not.toHaveBeenCalled();
  });

  it("rejects the Studio manual secret and accepts only CRON_SECRET", async () => {
    vi.stubEnv("GUITTA_STUDIO_META_CRON_ENABLED", "true");
    vi.stubEnv("CRON_SECRET", "cron-only-secret");
    vi.stubEnv("GUITTA_STUDIO_META_MANUAL_SECRET", "manual-only-secret");

    const response = await GET(new Request(
      "https://example.com/api/cron/guitta-studio-scheduled-publish",
      { headers: { authorization: "Bearer manual-only-secret" } },
    ));

    expect(response.status).toBe(401);
    expect(mocks.run).not.toHaveBeenCalled();
  });

  it("runs once with the Vercel cron secret", async () => {
    vi.stubEnv("GUITTA_STUDIO_META_CRON_ENABLED", "true");
    vi.stubEnv("CRON_SECRET", "cron-only-secret");

    const response = await GET(new Request(
      "https://example.com/api/cron/guitta-studio-scheduled-publish",
      { headers: { authorization: "Bearer cron-only-secret" } },
    ));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: "no-publication-today", calls: 0 });
    expect(mocks.run).toHaveBeenCalledTimes(1);
    expect(mocks.pause).not.toHaveBeenCalled();
    expect(mocks.alert).not.toHaveBeenCalled();
  });

  it("pauses and alerts when an unexpected error escapes the runner", async () => {
    vi.stubEnv("GUITTA_STUDIO_META_CRON_ENABLED", "true");
    vi.stubEnv("CRON_SECRET", "cron-only-secret");
    mocks.run.mockRejectedValue(new Error("unexpected"));

    const response = await GET(new Request(
      "https://example.com/api/cron/guitta-studio-scheduled-publish",
      { headers: { authorization: "Bearer cron-only-secret" } },
    ));

    expect(response.status).toBe(500);
    expect(mocks.pause).toHaveBeenCalledTimes(1);
    expect(mocks.alert).toHaveBeenCalledTimes(1);
  });
});
