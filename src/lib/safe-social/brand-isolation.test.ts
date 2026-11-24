import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BICHITTOS } from "./brands";
import { performMetaOperation } from "./meta";
import { runScheduledPublisher } from "./scheduled-run";
import { selectWorkItem } from "./select-due";
import { createBrandStore, type BrandStore } from "./state";
import type { PlatformState, PublicationItem } from "./types";

const META_NAMES = [
  "META_GRAPH_API_VERSION",
  "META_ACCESS_TOKEN",
  "FACEBOOK_PAGE_ACCESS_TOKEN",
  "INSTAGRAM_USER_ID",
  "FACEBOOK_PAGE_ID",
];

const item: PublicationItem = {
  occurrence: "012",
  postId: "bichittos-012",
  scheduledAt: "2026-11-27T09:00:00-03:00",
  world: "bobbin",
  type: "character",
  media: { kind: "image", image: { url: "https://media.example/bobbin.png" } },
  instagram: { caption: "Bobbin" },
  facebook: { message: "Bobbin" },
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

describe("Bichittos brand isolation", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("Bichittos Meta call reads only BICHITTOS_* env", async () => {
    for (const name of META_NAMES) {
      vi.stubEnv(`GUITTA_STUDIO_${name}`, "studio-value");
      vi.stubEnv(`BICHITTOS_${name}`, "");
    }
    const fetchImpl = vi.fn();

    await expect(performMetaOperation(BICHITTOS, {
      operation: "create_instagram_container",
      carouselIndex: null,
      occurrence: item.occurrence,
      correlationId: "correlation",
      item,
      platformState: pending,
      fetchImpl: fetchImpl as unknown as typeof fetch,
      log: () => {},
    })).rejects.toThrow(/BICHITTOS_META_GRAPH_API_VERSION is not configured/);
    expect(fetchImpl).toHaveBeenCalledTimes(0);
  });

  it("Bichittos store writes only under publications/bichittos/", async () => {
    vi.stubEnv("GUITTA_STUDIO_AUTOMATION_BUCKET", "studio-bucket");
    vi.stubEnv("BICHITTOS_AUTOMATION_BUCKET", "bichittos-bucket");
    const commands: Array<{ Bucket?: string; Key?: string }> = [];
    vi.spyOn(S3Client.prototype, "send").mockImplementation((async (command: { input: { Bucket?: string; Key?: string } }) => {
      commands.push(command.input);
      if (command instanceof PutObjectCommand) return { ETag: "etag" };
      throw Object.assign(new Error("missing"), { name: "NoSuchKey" });
    }) as never);

    const store = createBrandStore(BICHITTOS);
    await expect(store.acquire("012", new Date("2026-11-27T12:30:00Z"), "owner")).resolves.toMatchObject({ status: "acquired" });
    await store.pauseSchedule("test pause", new Date("2026-11-27T12:30:00Z"));

    expect(commands.length).toBeGreaterThanOrEqual(4);
    for (const input of commands) {
      expect(input.Key?.startsWith("publications/bichittos/")).toBe(true);
      expect(input.Bucket).toBe("bichittos-bucket");
    }
  });

  it("Bichittos legacy state object goes to needs-review with zero calls", async () => {
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
        new Error("Occurrence 012 uses legacy state and requires a human migration before any Meta call."),
      ),
      save: vi.fn(),
      consumeScheduleAuthorization: vi.fn(),
      pauseSchedule,
      verifyStateAccess: vi.fn(),
      readBrandControl: vi.fn(),
      consumeBrandAuthorization: vi.fn(),
      pauseBrand: vi.fn(),
    } as unknown as BrandStore;

    const result = await runScheduledPublisher(BICHITTOS, new Date("2026-11-27T12:30:00Z"), store);

    expect(result).toMatchObject({ status: "needs-review", occurrence: "012", calls: 0 });
    expect(pauseSchedule).toHaveBeenCalledTimes(1);
    expect(store.save).not.toHaveBeenCalled();
    expect(store.consumeScheduleAuthorization).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("Bobbin 012 is the only Bichittos work item on 2026-11-27", () => {
    const selection = selectWorkItem(
      BICHITTOS.queue.items,
      new Date("2026-11-27T12:30:00Z"),
      BICHITTOS.queue.timezone,
      BICHITTOS.sameDay,
      () => false,
    );
    expect(selection).toMatchObject({ kind: "item", item: { occurrence: "012" } });

    const afterBobbin = selectWorkItem(
      BICHITTOS.queue.items,
      new Date("2026-11-27T12:30:00Z"),
      BICHITTOS.queue.timezone,
      BICHITTOS.sameDay,
      (candidate) => candidate.occurrence === "012",
    );
    expect(afterBobbin).toEqual({ kind: "none" });
  });

  it("Christmas 021/022 are 6 hours apart after the queue change", () => {
    const now = new Date("2026-12-25T18:30:00Z");
    const first = selectWorkItem(BICHITTOS.queue.items, now, BICHITTOS.queue.timezone, BICHITTOS.sameDay, () => false);
    expect(first).toMatchObject({ kind: "item", item: { occurrence: "021" } });

    const second = selectWorkItem(
      BICHITTOS.queue.items,
      now,
      BICHITTOS.queue.timezone,
      BICHITTOS.sameDay,
      (candidate) => candidate.occurrence === "021",
    );
    expect(second).toMatchObject({ kind: "item", item: { occurrence: "022" } });
  });
});
