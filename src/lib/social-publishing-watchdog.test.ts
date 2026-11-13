import { beforeEach, describe, expect, it, vi } from "vitest";
import { runSocialPublishingWatchdog } from "./social-publishing-watchdog";

const mocks = vi.hoisted(() => ({
  kammaraControl: vi.fn(),
  kammaraState: vi.fn(),
  bichittosControl: vi.fn(),
  bichittosState: vi.fn(),
  studioControl: vi.fn(),
  studioState: vi.fn(),
}));

vi.mock("@/lib/kammara-social/state", () => ({
  readBrandControl: mocks.kammaraControl,
  readPublicationState: mocks.kammaraState,
}));
vi.mock("@/lib/bichittos-social/state", () => ({
  readBrandControl: mocks.bichittosControl,
  readPublicationState: mocks.bichittosState,
}));
vi.mock("@/lib/guitta-studio-social/state", () => ({
  readStudioScheduleControl: mocks.studioControl,
  readPublicationState: mocks.studioState,
}));

describe("social publishing watchdog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.kammaraControl.mockResolvedValue({ publishingEnabled: false });
    mocks.bichittosControl.mockResolvedValue({ publishingEnabled: false });
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
});
