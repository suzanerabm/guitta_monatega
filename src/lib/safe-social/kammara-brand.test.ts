import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { afterEach, describe, expect, it, vi } from "vitest";
import { KAMMARA } from "./brands";
import { performMetaOperation } from "./meta";
import { runManualPublisher } from "./run";
import { advancePublication } from "./safe-publisher";
import { runScheduledPublisher } from "./scheduled-run";
import { selectWorkItem } from "./select-due";
import { createBrandStore, type BrandStore } from "./state";
import type { PlatformState, PublicationItem } from "./types";

// Pass-through by default; only the manual-run test replaces it, to prove the run reaches the
// state machine without performing any Meta call.
vi.mock("./safe-publisher", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./safe-publisher")>();
  return { ...actual, advancePublication: vi.fn(actual.advancePublication) };
});

const META_NAMES = [
  "META_GRAPH_API_VERSION",
  "META_ACCESS_TOKEN",
  "FACEBOOK_PAGE_ACCESS_TOKEN",
  "INSTAGRAM_USER_ID",
  "FACEBOOK_PAGE_ID",
];

const item: PublicationItem = {
  occurrence: "010",
  postId: "orfv-character-maelik",
  scheduledAt: "2026-11-24T08:00:00-03:00",
  world: "orfv",
  type: "character",
  media: { kind: "image", image: { url: "https://media.example/maelik.png" } },
  instagram: { caption: "Maelik" },
  facebook: { message: "Maelik" },
};

const pending: PlatformState = {
  status: "pending",
  externalId: null,
  containerId: null,
  nextActionAt: null,
  statusChecks: 0,
  inFlight: null,
  carousel: null,
  error: null,
};

describe("Kammara brand isolation", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("Kammara Meta call reads only KAMMARA_* env", async () => {
    for (const name of META_NAMES) {
      vi.stubEnv(`GUITTA_STUDIO_${name}`, "studio-value");
      vi.stubEnv(`BICHITTOS_${name}`, "bichittos-value");
      vi.stubEnv(`KAMMARA_${name}`, "");
    }
    const fetchImpl = vi.fn();

    await expect(performMetaOperation(KAMMARA, {
      operation: "create_instagram_container",
      carouselIndex: null,
      occurrence: item.occurrence,
      correlationId: "correlation",
      item,
      platformState: pending,
      fetchImpl: fetchImpl as unknown as typeof fetch,
      log: () => {},
    })).rejects.toThrow(/KAMMARA_META_GRAPH_API_VERSION is not configured/);
    expect(fetchImpl).toHaveBeenCalledTimes(0);
  });

  it("Kammara store writes only under publications/kammara/", async () => {
    vi.stubEnv("GUITTA_STUDIO_AUTOMATION_BUCKET", "studio-bucket");
    vi.stubEnv("BICHITTOS_AUTOMATION_BUCKET", "bichittos-bucket");
    vi.stubEnv("KAMMARA_AUTOMATION_BUCKET", "kammara-bucket");
    const commands: Array<{ Bucket?: string; Key?: string }> = [];
    vi.spyOn(S3Client.prototype, "send").mockImplementation((async (command: { input: { Bucket?: string; Key?: string } }) => {
      commands.push(command.input);
      if (command instanceof PutObjectCommand) return { ETag: "etag" };
      throw Object.assign(new Error("missing"), { name: "NoSuchKey" });
    }) as never);

    const store = createBrandStore(KAMMARA);
    await expect(store.acquire("010", new Date("2026-11-24T12:30:00Z"), "owner")).resolves.toMatchObject({ status: "acquired" });
    await store.pauseSchedule("test pause", new Date("2026-11-24T12:30:00Z"));

    expect(commands.length).toBeGreaterThanOrEqual(4);
    for (const input of commands) {
      expect(input.Key?.startsWith("publications/kammara/")).toBe(true);
      expect(input.Bucket).toBe("kammara-bucket");
    }
  });

  it("Kammara legacy state object goes to needs-review with zero calls", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const pauseSchedule = vi.fn().mockResolvedValue(undefined);
    const store = {
      readScheduleControl: vi.fn().mockResolvedValue({
        schemaVersion: 1,
        enabled: true,
        allowedPlatforms: ["instagram", "facebook"],
        callsDate: null,
        callsToday: 0,
        lastAuthorization: null,
        pauseReason: null,
        pausedAt: null,
        pausedBy: null,
      }),
      readPublicationState: vi.fn().mockResolvedValue(null),
      acquire: vi.fn().mockRejectedValue(
        new Error("Occurrence 010 uses legacy state and requires a human migration before any Meta call."),
      ),
      save: vi.fn(),
      consumeScheduleAuthorization: vi.fn(),
      pauseSchedule,
      verifyStateAccess: vi.fn(),
      readBrandControl: vi.fn(),
      consumeBrandAuthorization: vi.fn(),
      pauseBrand: vi.fn(),
    } as unknown as BrandStore;

    const result = await runScheduledPublisher(KAMMARA, new Date("2026-11-24T12:30:00Z"), store);

    expect(result).toMatchObject({ status: "needs-review", occurrence: "010", calls: 0 });
    expect(pauseSchedule).toHaveBeenCalledTimes(1);
    expect(store.save).not.toHaveBeenCalled();
    expect(store.consumeScheduleAuthorization).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("Maelik 010 is the only Kammara work item on 2026-11-24", () => {
    const now = new Date("2026-11-24T12:30:00Z");
    const selection = selectWorkItem(KAMMARA.queue.items, now, KAMMARA.queue.timezone, KAMMARA.sameDay, () => false);
    expect(selection).toMatchObject({ kind: "item", item: { occurrence: "010", postId: "orfv-character-maelik" } });

    const afterMaelik = selectWorkItem(
      KAMMARA.queue.items,
      now,
      KAMMARA.queue.timezone,
      KAMMARA.sameDay,
      (candidate) => candidate.occurrence === "010",
    );
    expect(afterMaelik).toEqual({ kind: "none" });
  });

  it("aerial-view 020 is the Kammara work item on 2026-11-25", () => {
    const selection = selectWorkItem(
      KAMMARA.queue.items,
      new Date("2026-11-25T12:30:00Z"),
      KAMMARA.queue.timezone,
      KAMMARA.sameDay,
      () => false,
    );
    expect(selection).toMatchObject({ kind: "item", item: { occurrence: "020", postId: "aerial-view" } });
  });

  it("treats the Kammara queue as active in America/Sao_Paulo", () => {
    expect(KAMMARA.queue.mode).toBe("active");
    expect(KAMMARA.queue.timezone).toBe("America/Sao_Paulo");
    expect(KAMMARA).toMatchObject({
      id: "kammara",
      alertBrand: "Kammara",
      envPrefix: "KAMMARA",
      statePrefix: "publications/kammara/",
      maxMetaCallsPerDay: 32,
      sameDay: { kind: "min-gap", minGapMs: 4 * 60 * 60 * 1000 },
    });
  });

  it("manual run reaches advancePublication for 010 after the cron window", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const advance = vi.mocked(advancePublication);
    advance.mockResolvedValueOnce({
      stored: {} as never,
      result: { status: "stub", calls: 0 } as never,
    });
    const now = new Date("2026-11-24T20:00:00Z");
    const stored = { state: { occurrence: "010" }, etag: "etag" };
    const store = {
      readBrandControl: vi.fn().mockResolvedValue({
        publishingEnabled: true,
        allowedOccurrence: "010",
        allowedPlatforms: ["instagram"],
        allowedOperation: "create_instagram_container",
        allowedCarouselIndex: null,
        authorizationExpiresAt: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
        pauseReason: null,
        pausedAt: null,
        pausedBy: null,
      }),
      acquire: vi.fn().mockResolvedValue({ status: "acquired", stored }),
      save: vi.fn(),
      consumeBrandAuthorization: vi.fn(),
      pauseBrand: vi.fn(),
    } as unknown as BrandStore;

    const result = await runManualPublisher(KAMMARA, now, false, store);

    expect(advance).toHaveBeenCalledTimes(1);
    expect(advance.mock.calls[0][0]).toBe(KAMMARA);
    expect(advance.mock.calls[0][1]).toMatchObject({
      occurrence: "010",
      item: { occurrence: "010", postId: "orfv-character-maelik" },
      stored,
      allowedPlatforms: ["instagram"],
    });
    expect(result).toMatchObject({ occurrence: "010", postId: "orfv-character-maelik", status: "stub" });
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
