import { beforeEach, describe, expect, it, vi } from "vitest";
import { runGuittaStudioScheduledPublisher } from "./scheduled-run";

const mocks = vi.hoisted(() => ({
  advance: vi.fn(),
  acquire: vi.fn(),
  consume: vi.fn(),
  pause: vi.fn(),
  readState: vi.fn(),
  readControl: vi.fn(),
  save: vi.fn(),
}));

vi.mock("./safe-publisher", () => ({ advanceStudioPublication: mocks.advance }));
vi.mock("./state", () => ({
  acquire: mocks.acquire,
  consumeStudioScheduleAuthorization: mocks.consume,
  pauseStudioSchedule: mocks.pause,
  readPublicationState: mocks.readState,
  readStudioScheduleControl: mocks.readControl,
  save: mocks.save,
}));

describe("Studio scheduled publisher", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.readControl.mockResolvedValue({ enabled: true, allowedPlatforms: ["instagram", "facebook"] });
    mocks.readState.mockResolvedValue(null);
    mocks.acquire.mockResolvedValue({ status: "acquired", stored: { state: {}, etag: "etag" } });
    mocks.advance.mockResolvedValue({
      stored: { state: {}, etag: "etag" },
      result: { status: "waiting", platform: "instagram", operation: null, calls: 0 },
    });
  });

  it("does not catch up past posts and does not touch state on an empty day", async () => {
    await expect(runGuittaStudioScheduledPublisher(new Date("2026-11-12T15:00:00.000Z"))).resolves.toEqual({
      status: "no-publication-today",
      calls: 0,
    });
    expect(mocks.readControl).not.toHaveBeenCalled();
    expect(mocks.acquire).not.toHaveBeenCalled();
    expect(mocks.advance).not.toHaveBeenCalled();
  });

  it("selects only today's occurrence and uses only the explicitly authorized Studio platforms", async () => {
    const result = await runGuittaStudioScheduledPublisher(new Date("2026-11-14T12:00:00.000Z"));

    expect(result).toMatchObject({ occurrence: "006", postId: "studio-006", calls: 0 });
    expect(mocks.acquire).toHaveBeenCalledWith("006", expect.any(Date), expect.any(String));
    expect(mocks.advance).toHaveBeenCalledWith(expect.objectContaining({
      occurrence: "006",
      allowedPlatforms: ["instagram", "facebook"],
    }));
  });

  it("returns before occurrence state when the persistent schedule switch is off", async () => {
    mocks.readControl.mockResolvedValue({
      enabled: false,
      allowedPlatforms: ["instagram", "facebook"],
      pauseReason: "human pause",
      pausedAt: null,
    });

    await expect(runGuittaStudioScheduledPublisher(new Date("2026-11-14T12:00:00.000Z"))).resolves.toMatchObject({
      status: "schedule-paused",
      calls: 0,
    });
    expect(mocks.readState).not.toHaveBeenCalled();
    expect(mocks.acquire).not.toHaveBeenCalled();
  });

  it("does not keep writing locks after Instagram is published", async () => {
    mocks.readState.mockResolvedValue({
      instagram: { status: "published" },
      facebook: { status: "published" },
    });

    await expect(runGuittaStudioScheduledPublisher(new Date("2026-11-14T15:00:00.000Z"))).resolves.toMatchObject({
      status: "published",
      occurrence: "006",
      calls: 0,
    });
    expect(mocks.acquire).not.toHaveBeenCalled();
    expect(mocks.advance).not.toHaveBeenCalled();
  });

  it("continues with Facebook after Instagram is published", async () => {
    mocks.readState.mockResolvedValue({
      instagram: { status: "published" },
      facebook: { status: "pending" },
    });

    await runGuittaStudioScheduledPublisher(new Date("2026-11-14T15:00:00.000Z"));

    expect(mocks.acquire).toHaveBeenCalledTimes(1);
    expect(mocks.advance).toHaveBeenCalledWith(expect.objectContaining({
      allowedPlatforms: ["instagram", "facebook"],
    }));
  });

  it("pauses without touching occurrence state when no platform is explicitly authorized", async () => {
    mocks.readControl.mockResolvedValue({ enabled: true, allowedPlatforms: [] });

    await expect(runGuittaStudioScheduledPublisher(new Date("2026-11-14T12:00:00.000Z"))).resolves.toMatchObject({
      status: "needs-review",
      calls: 0,
    });
    expect(mocks.pause).toHaveBeenCalledTimes(1);
    expect(mocks.readState).not.toHaveBeenCalled();
  });

  it("pauses the whole schedule when an occurrence needs review", async () => {
    mocks.advance.mockResolvedValue({
      stored: { state: {}, etag: "etag" },
      result: { status: "needs-review", platform: "instagram", operation: null, calls: 0 },
    });

    await expect(runGuittaStudioScheduledPublisher(new Date("2026-11-14T12:00:00.000Z"))).resolves.toMatchObject({
      status: "needs-review",
      calls: 0,
    });
    expect(mocks.pause).toHaveBeenCalledTimes(1);
  });
});
