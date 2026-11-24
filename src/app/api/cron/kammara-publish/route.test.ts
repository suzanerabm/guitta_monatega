import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

const mocks = vi.hoisted(() => ({
  run: vi.fn(),
  verify: vi.fn(),
  alert: vi.fn(),
  order: [] as string[],
}));

vi.mock("@/lib/safe-social/run", () => ({
  runManualPublisher: mocks.run,
}));
vi.mock("@/lib/safe-social/state", () => ({
  storeFor: () => ({ verifyStateAccess: mocks.verify }),
}));
vi.mock("@/lib/social-publishing-alerts", () => ({
  reportPublishingFailure: mocks.alert,
}));

const URL = "https://example.com/api/cron/kammara-publish";

describe("Kammara manual publishing route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.order.length = 0;
    mocks.verify.mockImplementation(async () => { mocks.order.push("verify"); });
    mocks.run.mockImplementation(async () => {
      mocks.order.push("run");
      return { status: "dry-run", calls: 0 };
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("stays paused without KAMMARA_META_ROUTE_ENABLED=true", async () => {
    vi.stubEnv("GUITTA_STUDIO_META_ROUTE_ENABLED", "true");
    vi.stubEnv("KAMMARA_META_MANUAL_SECRET", "kammara-only-secret");

    const response = await GET(new Request(URL, { headers: { authorization: "Bearer kammara-only-secret" } }));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({ paused: true });
    expect(mocks.run).not.toHaveBeenCalled();
    expect(mocks.verify).not.toHaveBeenCalled();
  });

  it("rejects CRON_SECRET and requires the Kammara manual secret", async () => {
    vi.stubEnv("KAMMARA_META_ROUTE_ENABLED", "true");
    vi.stubEnv("CRON_SECRET", "shared-secret");
    vi.stubEnv("KAMMARA_META_MANUAL_SECRET", "kammara-only-secret");

    const response = await GET(new Request(URL, { headers: { authorization: "Bearer shared-secret" } }));

    expect(response.status).toBe(401);
    expect(mocks.run).not.toHaveBeenCalled();
    expect(mocks.verify).not.toHaveBeenCalled();
  });

  it("verifies Kammara state access before a dry run", async () => {
    vi.stubEnv("KAMMARA_META_ROUTE_ENABLED", "true");
    vi.stubEnv("KAMMARA_META_MANUAL_SECRET", "kammara-only-secret");

    const response = await GET(new Request(`${URL}?dryRun=1`, { headers: { authorization: "Bearer kammara-only-secret" } }));

    expect(response.status).toBe(200);
    expect(mocks.order).toEqual(["verify", "run"]);
    expect(mocks.run).toHaveBeenCalledWith(expect.objectContaining({ id: "kammara" }), expect.any(Date), true);
  });
});
