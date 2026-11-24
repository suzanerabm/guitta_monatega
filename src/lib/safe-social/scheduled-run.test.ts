import { beforeEach, describe, expect, it, vi } from "vitest";
import { GUITTA_STUDIO, type SafeBrand } from "./brands";
import type { PublicationItem } from "./types";
import { runScheduledPublisher } from "./scheduled-run";
import type { BrandStore } from "./state";

const mocks = vi.hoisted(() => ({
  advance: vi.fn(),
  acquire: vi.fn(),
  consume: vi.fn(),
  pause: vi.fn(),
  readState: vi.fn(),
  readControl: vi.fn(),
  save: vi.fn(),
}));

vi.mock("./safe-publisher", () => ({ advancePublication: mocks.advance }));

const store = {
  acquire: mocks.acquire,
  consumeScheduleAuthorization: mocks.consume,
  pauseSchedule: mocks.pause,
  readPublicationState: mocks.readState,
  readScheduleControl: mocks.readControl,
  save: mocks.save,
  verifyStateAccess: vi.fn(),
  readBrandControl: vi.fn(),
  consumeBrandAuthorization: vi.fn(),
  pauseBrand: vi.fn(),
} as unknown as BrandStore;

const runGuittaStudioScheduledPublisher = (now: Date) => runScheduledPublisher(GUITTA_STUDIO, now, store);

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
    expect(mocks.advance).toHaveBeenCalledWith(GUITTA_STUDIO, expect.objectContaining({
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
    expect(mocks.advance).toHaveBeenCalledWith(GUITTA_STUDIO, expect.objectContaining({
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

function bichitto(occurrence: string, scheduledAt: string): PublicationItem {
  return {
    occurrence,
    postId: `bichittos-${occurrence}`,
    scheduledAt,
    world: "bichittos",
    type: "test",
    media: { kind: "image", image: { url: "https://media.example/test.jpg" } },
    instagram: { caption: "Test" },
    facebook: { message: "Test" },
  };
}

function minGapBrand(items: PublicationItem[]): SafeBrand {
  return {
    ...GUITTA_STUDIO,
    sameDay: { kind: "min-gap", minGapMs: 4 * 3600_000 },
    queue: { mode: "active", timezone: "America/Sao_Paulo", items },
  };
}

describe("min-gap brand scheduled publisher", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.readControl.mockResolvedValue({ enabled: true, allowedPlatforms: ["instagram"] });
    mocks.readState.mockResolvedValue(null);
    mocks.acquire.mockResolvedValue({ status: "acquired", stored: { state: {}, etag: "etag" } });
    mocks.advance.mockResolvedValue({
      stored: { state: {}, etag: "etag" },
      result: { status: "waiting", platform: "instagram", operation: null, calls: 0 },
    });
  });

  it("min-gap brand: first published on allowed platforms lets the second run", async () => {
    const brand = minGapBrand([
      bichitto("021", "2026-11-13T09:00:00-03:00"),
      bichitto("022", "2026-11-13T15:00:00-03:00"),
    ]);
    mocks.readState.mockImplementation(async (occurrence: string) =>
      occurrence === "021" ? { instagram: { status: "published" }, facebook: { status: "pending" } } : null);

    await runScheduledPublisher(brand, new Date("2026-11-13T18:30:00.000Z"), store);

    expect(mocks.advance).toHaveBeenCalledTimes(1);
    expect(mocks.advance).toHaveBeenCalledWith(brand, expect.objectContaining({ occurrence: "022" }));
    expect(mocks.acquire).toHaveBeenCalledWith("022", expect.any(Date), expect.any(String));
  });

  it("min-gap brand: conflict pauses the schedule with zero calls", async () => {
    const brand = minGapBrand([
      bichitto("021", "2026-11-13T09:00:00-03:00"),
      bichitto("022", "2026-11-13T10:00:00-03:00"),
    ]);

    await expect(runScheduledPublisher(brand, new Date("2026-11-13T12:30:00.000Z"), store)).resolves.toEqual({
      status: "schedule-conflict",
      occurrences: ["021", "022"],
      calls: 0,
    });
    expect(mocks.pause).toHaveBeenCalledTimes(1);
    expect(mocks.acquire).not.toHaveBeenCalled();
    expect(mocks.advance).not.toHaveBeenCalled();
  });

  it("min-gap brand: reads at most one state per due item and never touches S3 on an empty day", async () => {
    const brand = minGapBrand([bichitto("021", "2026-11-13T09:00:00-03:00")]);
    await runScheduledPublisher(brand, new Date("2026-11-14T12:00:00.000Z"), store);
    expect(mocks.readControl).not.toHaveBeenCalled();
    expect(mocks.readState).not.toHaveBeenCalled();
  });
});
