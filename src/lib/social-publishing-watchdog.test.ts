import { beforeEach, describe, expect, it, vi } from "vitest";
import { runSocialPublishingWatchdog } from "./social-publishing-watchdog";

const mocks = vi.hoisted(() => ({
  kammaraControl: vi.fn(),
  kammaraState: vi.fn(),
  bichittosControl: vi.fn(),
  bichittosState: vi.fn(),
  studioControl: vi.fn(),
  studioState: vi.fn(),
  alert: vi.fn(),
}));

vi.mock("@/lib/social-publishing-alerts", () => ({
  sendPublishingAlert: mocks.alert,
}));

vi.mock("@/lib/kammara-social/state", () => ({
  readBrandControl: mocks.kammaraControl,
  readPublicationState: mocks.kammaraState,
}));
vi.mock("@/lib/safe-social/state", () => ({
  storeFor: (brand: { id: string }) => brand.id === "bichittos"
    ? { readScheduleControl: mocks.bichittosControl, readPublicationState: mocks.bichittosState }
    : { readScheduleControl: mocks.studioControl, readPublicationState: mocks.studioState },
}));

describe("social publishing watchdog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.kammaraControl.mockResolvedValue({ publishingEnabled: false });
    mocks.bichittosControl.mockResolvedValue({ enabled: false });
    mocks.studioControl.mockResolvedValue({ enabled: false });
  });

  it("stays healthy before the first scheduled publication", async () => {
    await expect(runSocialPublishingWatchdog(new Date("2026-10-10T10:59:59Z"))).resolves.toEqual({
      status: "healthy",
      checked: 0,
      failures: 0,
    });
  });

  it("does not inspect occurrences or alert for intentionally paused brands", async () => {
    await expect(runSocialPublishingWatchdog(new Date("2026-10-10T12:00:00Z"))).resolves.toEqual({
      status: "healthy",
      checked: 0,
      failures: 0,
    });
    expect(mocks.kammaraState).not.toHaveBeenCalled();
    expect(mocks.bichittosState).not.toHaveBeenCalled();
    expect(mocks.studioState).not.toHaveBeenCalled();
  });

  it("checks only an explicitly enabled brand", async () => {
    mocks.studioControl.mockResolvedValue({ enabled: true });
    mocks.studioState.mockResolvedValue({
      instagram: { status: "published" },
      facebook: { status: "published" },
    });

    await expect(runSocialPublishingWatchdog(new Date("2026-10-10T12:00:00Z"))).resolves.toEqual({
      status: "healthy",
      checked: 1,
      failures: 0,
    });
    expect(mocks.kammaraState).not.toHaveBeenCalled();
    expect(mocks.bichittosState).not.toHaveBeenCalled();
    expect(mocks.studioState).toHaveBeenCalledTimes(1);
  });

  it("reads Bichittos through its own safe store and schedule control", async () => {
    mocks.bichittosControl.mockResolvedValue({ enabled: true });
    mocks.bichittosState.mockResolvedValue({
      instagram: { status: "published" },
      facebook: { status: "pending" },
    });
    mocks.studioControl.mockResolvedValue({ enabled: false });

    await expect(runSocialPublishingWatchdog(new Date("2026-11-27T13:00:00Z"))).resolves.toMatchObject({
      status: "alert-sent",
      checked: 1,
      failures: 1,
    });
    expect(mocks.bichittosState).toHaveBeenCalledWith("012");
    expect(mocks.alert).toHaveBeenCalledWith(expect.objectContaining({
      details: [expect.stringContaining("Bichittos 012")],
    }));
    expect(mocks.studioState).not.toHaveBeenCalled();
    expect(mocks.kammaraState).not.toHaveBeenCalled();
  });
});
