import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

const mocks = vi.hoisted(() => ({
  run: vi.fn(),
  pause: vi.fn(),
  alert: vi.fn(),
  storeBrand: vi.fn(),
}));

vi.mock("@/lib/safe-social/scheduled-run", () => ({
  runScheduledPublisher: mocks.run,
}));
vi.mock("@/lib/safe-social/state", () => ({
  storeFor: (brand: { id: string }) => {
    mocks.storeBrand(brand.id);
    return { pauseSchedule: mocks.pause };
  },
}));
vi.mock("@/lib/social-publishing-alerts", () => ({
  reportPublishingFailure: mocks.alert,
}));

const URL = "https://example.com/api/cron/kammara-scheduled-publish";

describe("Kammara scheduled publishing route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.run.mockResolvedValue({ status: "no-publication-today", calls: 0 });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("is disabled unless the Kammara cron flag is the exact literal true", async () => {
    vi.stubEnv("GUITTA_STUDIO_META_CRON_ENABLED", "true");
    vi.stubEnv("KAMMARA_META_CRON_ENABLED", "TRUE");
    vi.stubEnv("CRON_SECRET", "cron-only-secret");

    const response = await GET(new Request(URL, { headers: { authorization: "Bearer cron-only-secret" } }));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      paused: true,
      message: "Kammara scheduled publishing is disabled.",
    });
    expect(mocks.run).not.toHaveBeenCalled();
    expect(mocks.pause).not.toHaveBeenCalled();
  });

  it("rejects the Kammara manual secret and accepts only CRON_SECRET", async () => {
    vi.stubEnv("KAMMARA_META_CRON_ENABLED", "true");
    vi.stubEnv("CRON_SECRET", "cron-only-secret");
    vi.stubEnv("KAMMARA_META_MANUAL_SECRET", "manual-only-secret");

    const response = await GET(new Request(URL, { headers: { authorization: "Bearer manual-only-secret" } }));

    expect(response.status).toBe(401);
    expect(mocks.run).not.toHaveBeenCalled();
  });

  it("runs once for the Kammara brand with the Vercel cron secret", async () => {
    vi.stubEnv("KAMMARA_META_CRON_ENABLED", "true");
    vi.stubEnv("CRON_SECRET", "cron-only-secret");

    const response = await GET(new Request(URL, { headers: { authorization: "Bearer cron-only-secret" } }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: "no-publication-today", calls: 0 });
    expect(mocks.run).toHaveBeenCalledTimes(1);
    expect(mocks.run.mock.calls[0][0]).toMatchObject({ id: "kammara", envPrefix: "KAMMARA" });
    expect(mocks.alert).not.toHaveBeenCalled();
  });

  it("alerts as Kammara when the run needs review", async () => {
    vi.stubEnv("KAMMARA_META_CRON_ENABLED", "true");
    vi.stubEnv("CRON_SECRET", "cron-only-secret");
    mocks.run.mockResolvedValue({ status: "needs-review", occurrence: "010", reason: "legacy", calls: 0 });

    const response = await GET(new Request(URL, { headers: { authorization: "Bearer cron-only-secret" } }));

    expect(response.status).toBe(200);
    expect(mocks.alert).toHaveBeenCalledTimes(1);
    expect(mocks.alert).toHaveBeenCalledWith(expect.objectContaining({
      brand: "Kammara",
      summary: "O cron seguro do Kammara foi pausado para revisão.",
    }));
  });

  it("pauses the Kammara schedule and alerts when an unexpected error escapes the runner", async () => {
    vi.stubEnv("KAMMARA_META_CRON_ENABLED", "true");
    vi.stubEnv("CRON_SECRET", "cron-only-secret");
    mocks.run.mockRejectedValue(new Error("unexpected"));

    const response = await GET(new Request(URL, { headers: { authorization: "Bearer cron-only-secret" } }));

    expect(response.status).toBe(500);
    expect(mocks.storeBrand).toHaveBeenCalledWith("kammara");
    expect(mocks.pause).toHaveBeenCalledTimes(1);
    expect(mocks.alert).toHaveBeenCalledWith(expect.objectContaining({ brand: "Kammara" }));
  });
});
