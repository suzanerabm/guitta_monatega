import { describe, expect, it, vi } from "vitest";
import { MetaPublishingError } from "@/lib/social-meta/client";
import { performStudioMetaOperation, type StudioMetaResult } from "./meta";
import { advanceStudioPublication } from "./safe-publisher";
import type { StoredState } from "./state";
import type { PlatformState, PublicationItem } from "./types";

function platform(): PlatformState {
  return {
    status: "pending",
    externalId: null,
    containerId: null,
    nextActionAt: null,
    statusChecks: 0,
    inFlight: null,
    carousel: null,
    error: null,
  };
}

function stored(): StoredState {
  return {
    etag: "etag-1",
    state: {
      schemaVersion: 3,
      occurrence: "test-001",
      lockOwner: "owner",
      lockUntil: "2026-11-12T12:10:00.000Z",
      updatedAt: "2026-11-12T12:00:00.000Z",
      metaCalls: 0,
      instagram: platform(),
      facebook: platform(),
    },
  };
}

function item(kind: "image" | "carousel" | "reel" = "image"): PublicationItem {
  return {
    occurrence: "test-001",
    postId: "studio-test-001",
    scheduledAt: "2026-11-12T09:00:00-03:00",
    world: "studio",
    type: "test",
    media: kind === "image"
      ? { kind: "image", image: { url: "https://media.example/test.jpg" } }
      : kind === "carousel"
        ? { kind: "carousel", images: [{ url: "https://media.example/1.jpg" }, { url: "https://media.example/2.jpg" }] }
        : { kind: "reel", video: { url: "https://media.example/reel.mp4" }, cover: { url: "https://media.example/cover.jpg" } },
    instagram: { caption: "Safe test" },
    facebook: { message: "Safe test" },
  };
}

const ok = (overrides: Partial<StudioMetaResult> = {}): StudioMetaResult => ({
  id: "external-id",
  statusCode: null,
  status: null,
  pauseReason: null,
  ...overrides,
});

function harness(initial = stored()) {
  let current = initial;
  const saves: StoredState[] = [];
  const save = vi.fn(async (value: StoredState) => {
    current = value;
    saves.push(structuredClone(value));
    return value;
  });
  const consumeAuthorization = vi.fn(async () => {});
  const pauseBrand = vi.fn(async () => {});
  return {
    get current() { return current; },
    saves,
    save,
    consumeAuthorization,
    pauseBrand,
  };
}

describe("Studio safe publisher", () => {
  it("uses separate executions and at most one Meta call for the complete Instagram image flow", async () => {
    const state = harness();
    const operations: string[] = [];
    const performOperation = vi.fn(async (options: Parameters<typeof performStudioMetaOperation>[0]) => {
      operations.push(options.operation);
      if (options.operation === "check_instagram_container") return ok({ id: null, statusCode: "FINISHED" });
      return ok();
    });
    const run = (now: string) => advanceStudioPublication({
      occurrence: "test-001",
      item: item(),
      stored: state.current,
      allowedPlatforms: ["instagram"],
      now: new Date(now),
      save: state.save,
      consumeAuthorization: state.consumeAuthorization,
      pauseBrand: state.pauseBrand,
      performOperation,
    });

    const create = await run("2026-11-12T12:00:00.000Z");
    expect(create.result).toMatchObject({ operation: "create_instagram_container", calls: 1 });
    expect(state.current.state.instagram.status).toBe("container_created");

    const tooEarly = await run("2026-11-12T12:00:30.000Z");
    expect(tooEarly.result).toMatchObject({ status: "waiting", calls: 0 });

    const prepareCheck = await run("2026-11-12T12:01:01.000Z");
    expect(prepareCheck.result).toMatchObject({ status: "state-advanced", calls: 0 });
    expect(state.current.state.instagram.status).toBe("waiting_for_media");

    const check = await run("2026-11-12T12:01:02.000Z");
    expect(check.result).toMatchObject({ operation: "check_instagram_container", calls: 1 });
    expect(state.current.state.instagram.status).toBe("media_ready");

    const publish = await run("2026-11-12T12:01:03.000Z");
    expect(publish.result).toMatchObject({ operation: "publish_instagram_media", calls: 1 });
    expect(state.current.state.instagram.status).toBe("publish_requested");

    const confirmTooEarly = await run("2026-11-12T12:05:00.000Z");
    expect(confirmTooEarly.result).toMatchObject({ status: "waiting", calls: 0 });

    const confirm = await run("2026-11-12T12:06:04.000Z");
    expect(confirm.result).toMatchObject({ operation: "confirm_instagram_media", calls: 1, status: "published" });
    expect(state.current.state.instagram.status).toBe("published");
    expect(operations).toEqual([
      "create_instagram_container",
      "check_instagram_container",
      "publish_instagram_media",
      "confirm_instagram_media",
    ]);
    expect(performOperation).toHaveBeenCalledTimes(4);
    expect(state.consumeAuthorization).toHaveBeenCalledTimes(4);
  });

  it("never publishes Instagram and Facebook in the same execution", async () => {
    const state = harness();
    const performOperation = vi.fn(async () => ok());

    const outcome = await advanceStudioPublication({
      occurrence: "test-001",
      item: item(),
      stored: state.current,
      allowedPlatforms: ["instagram", "facebook"],
      now: new Date("2026-11-12T12:00:00.000Z"),
      save: state.save,
      consumeAuthorization: state.consumeAuthorization,
      pauseBrand: state.pauseBrand,
      performOperation,
    });

    expect(outcome.result).toMatchObject({ platform: "instagram", operation: "create_instagram_container", calls: 1 });
    expect(performOperation).toHaveBeenCalledTimes(1);
    expect(state.current.state.facebook.status).toBe("pending");
  });

  it("publishes and confirms a Facebook image in separate executions", async () => {
    const initial = stored();
    initial.state.instagram.status = "published";
    const state = harness(initial);
    const operations: string[] = [];
    const performOperation = vi.fn(async (options: Parameters<typeof performStudioMetaOperation>[0]) => {
      operations.push(options.operation);
      return ok();
    });
    const run = (now: string) => advanceStudioPublication({
      occurrence: "test-001",
      item: item(),
      stored: state.current,
      allowedPlatforms: ["instagram", "facebook"],
      now: new Date(now),
      save: state.save,
      consumeAuthorization: state.consumeAuthorization,
      pauseBrand: state.pauseBrand,
      performOperation,
    });

    expect((await run("2026-11-12T12:00:00.000Z")).result).toMatchObject({
      platform: "facebook",
      operation: "publish_facebook_image",
      calls: 1,
    });
    expect(state.current.state.facebook.status).toBe("publish_requested");
    expect((await run("2026-11-12T12:01:00.000Z")).result.calls).toBe(0);
    expect((await run("2026-11-12T12:05:01.000Z")).result).toMatchObject({
      platform: "facebook",
      operation: "confirm_facebook_media",
      calls: 1,
      status: "published",
    });
    expect(operations).toEqual(["publish_facebook_image", "confirm_facebook_media"]);
  });

  it("persists an in-flight marker before making the only external call", async () => {
    const state = harness();
    const performOperation = vi.fn(async () => {
      expect(state.saves).toHaveLength(1);
      expect(state.saves[0].state.instagram.inFlight?.operation).toBe("create_instagram_container");
      expect(state.consumeAuthorization).toHaveBeenCalledTimes(1);
      return ok();
    });

    const outcome = await advanceStudioPublication({
      occurrence: "test-001",
      item: item(),
      stored: state.current,
      allowedPlatforms: ["instagram"],
      now: new Date("2026-11-12T12:00:00.000Z"),
      save: state.save,
      consumeAuthorization: state.consumeAuthorization,
      pauseBrand: state.pauseBrand,
      performOperation,
    });

    expect(outcome.result.calls).toBe(1);
    expect(state.saves).toHaveLength(2);
    expect(state.saves[1].state.instagram.inFlight).toBeNull();
  });

  it("makes zero Meta calls when the one-shot authorization cannot be consumed", async () => {
    const state = harness();
    state.consumeAuthorization.mockRejectedValueOnce(new Error("conditional S3 write failed"));
    const performOperation = vi.fn();

    const outcome = await advanceStudioPublication({
      occurrence: "test-001",
      item: item(),
      stored: state.current,
      allowedPlatforms: ["instagram"],
      now: new Date("2026-11-12T12:00:00.000Z"),
      save: state.save,
      consumeAuthorization: state.consumeAuthorization,
      pauseBrand: state.pauseBrand,
      performOperation,
    });

    expect(outcome.result).toMatchObject({ status: "needs-review", calls: 0 });
    expect(performOperation).not.toHaveBeenCalled();
    expect(state.current.state.instagram.error).toContain("zero Meta calls made");
  });

  it("never repeats an operation left in-flight by an interrupted execution", async () => {
    const initial = stored();
    initial.state.instagram.inFlight = {
      operation: "publish_instagram_media",
      carouselIndex: null,
      correlationId: "previous",
      startedAt: "2026-11-12T11:59:00.000Z",
    };
    const state = harness(initial);
    const performOperation = vi.fn();

    const outcome = await advanceStudioPublication({
      occurrence: "test-001",
      item: item(),
      stored: state.current,
      allowedPlatforms: ["instagram"],
      now: new Date("2026-11-12T12:00:00.000Z"),
      save: state.save,
      consumeAuthorization: state.consumeAuthorization,
      pauseBrand: state.pauseBrand,
      performOperation,
    });

    expect(outcome.result).toMatchObject({ status: "needs-review", calls: 0 });
    expect(performOperation).not.toHaveBeenCalled();
    expect(state.current.state.instagram.error).toContain("automatic repetition is forbidden");
  });

  it("leaves a durable in-flight marker when persistence fails after a Meta response", async () => {
    const initial = stored();
    let persisted = structuredClone(initial);
    let saveCalls = 0;
    const save = vi.fn(async (value: StoredState) => {
      saveCalls += 1;
      if (saveCalls === 1) {
        persisted = structuredClone(value);
        return value;
      }
      throw new Error("simulated S3 failure after Meta response");
    });
    const firstOperation = vi.fn(async () => ok());

    await expect(advanceStudioPublication({
      occurrence: "test-001",
      item: item(),
      stored: initial,
      allowedPlatforms: ["instagram"],
      now: new Date("2026-11-12T12:00:00.000Z"),
      save,
      consumeAuthorization: vi.fn(async () => {}),
      pauseBrand: vi.fn(async () => {}),
      performOperation: firstOperation,
    })).rejects.toThrow("simulated S3 failure");

    expect(firstOperation).toHaveBeenCalledTimes(1);
    expect(persisted.state.instagram.inFlight?.operation).toBe("create_instagram_container");

    const recovery = harness(persisted);
    const repeatedOperation = vi.fn();
    const outcome = await advanceStudioPublication({
      occurrence: "test-001",
      item: item(),
      stored: recovery.current,
      allowedPlatforms: ["instagram"],
      now: new Date("2026-11-12T12:10:00.000Z"),
      save: recovery.save,
      consumeAuthorization: recovery.consumeAuthorization,
      pauseBrand: recovery.pauseBrand,
      performOperation: repeatedOperation,
    });

    expect(outcome.result).toMatchObject({ status: "needs-review", calls: 0 });
    expect(repeatedOperation).not.toHaveBeenCalled();
  });

  it("publishes an Instagram carousel as finite one-call steps", async () => {
    const state = harness();
    const operations: string[] = [];
    const performOperation = vi.fn(async (options: Parameters<typeof performStudioMetaOperation>[0]) => {
      operations.push(`${options.operation}:${options.carouselIndex ?? "parent"}`);
      if (options.operation.startsWith("check_")) return ok({ id: null, statusCode: "FINISHED" });
      return ok({ id: `${options.operation}-${options.carouselIndex ?? "parent"}` });
    });
    const run = (now: string) => advanceStudioPublication({
      occurrence: "test-001",
      item: item("carousel"),
      stored: state.current,
      allowedPlatforms: ["instagram"],
      now: new Date(now),
      save: state.save,
      consumeAuthorization: state.consumeAuthorization,
      pauseBrand: state.pauseBrand,
      performOperation,
    });

    expect((await run("2026-11-12T12:00:00.000Z")).result).toMatchObject({
      operation: "create_instagram_carousel_child", carouselIndex: 0, calls: 1,
    });
    expect((await run("2026-11-12T12:00:30.000Z")).result.calls).toBe(0);
    expect((await run("2026-11-12T12:01:00.000Z")).result).toMatchObject({
      operation: "check_instagram_carousel_child", carouselIndex: 0, calls: 1,
    });
    expect((await run("2026-11-12T12:01:01.000Z")).result).toMatchObject({
      operation: "create_instagram_carousel_child", carouselIndex: 1, calls: 1,
    });
    expect((await run("2026-11-12T12:02:01.000Z")).result).toMatchObject({
      operation: "check_instagram_carousel_child", carouselIndex: 1, calls: 1,
    });
    expect((await run("2026-11-12T12:02:02.000Z")).result).toMatchObject({
      operation: "create_instagram_carousel_container", calls: 1,
    });
    expect((await run("2026-11-12T12:03:02.000Z")).result).toMatchObject({ status: "state-advanced", calls: 0 });
    expect((await run("2026-11-12T12:03:03.000Z")).result).toMatchObject({
      operation: "check_instagram_container", calls: 1,
    });
    expect((await run("2026-11-12T12:03:04.000Z")).result).toMatchObject({
      operation: "publish_instagram_media", calls: 1,
    });
    expect((await run("2026-11-12T12:08:04.000Z")).result).toMatchObject({
      operation: "confirm_instagram_media", calls: 1, status: "published",
    });
    expect(operations).toEqual([
      "create_instagram_carousel_child:0",
      "check_instagram_carousel_child:0",
      "create_instagram_carousel_child:1",
      "check_instagram_carousel_child:1",
      "create_instagram_carousel_container:parent",
      "check_instagram_container:parent",
      "publish_instagram_media:parent",
      "confirm_instagram_media:parent",
    ]);
    expect(state.current.state.metaCalls).toBe(8);
    expect(state.consumeAuthorization).toHaveBeenCalledTimes(8);
  });

  it("publishes a Facebook carousel as finite one-call steps", async () => {
    const initial = stored();
    initial.state.instagram.status = "published";
    const state = harness(initial);
    const operations: string[] = [];
    const performOperation = vi.fn(async (options: Parameters<typeof performStudioMetaOperation>[0]) => {
      operations.push(`${options.operation}:${options.carouselIndex ?? "parent"}`);
      return ok({ id: `${options.operation}-${options.carouselIndex ?? "parent"}` });
    });
    const run = (now: string) => advanceStudioPublication({
      occurrence: "test-001",
      item: item("carousel"),
      stored: state.current,
      allowedPlatforms: ["facebook"],
      now: new Date(now),
      save: state.save,
      consumeAuthorization: state.consumeAuthorization,
      pauseBrand: state.pauseBrand,
      performOperation,
    });

    expect((await run("2026-11-12T12:00:00.000Z")).result).toMatchObject({
      operation: "create_facebook_carousel_child", carouselIndex: 0, calls: 1,
    });
    expect((await run("2026-11-12T12:00:01.000Z")).result).toMatchObject({
      operation: "create_facebook_carousel_child", carouselIndex: 1, calls: 1,
    });
    expect((await run("2026-11-12T12:00:02.000Z")).result).toMatchObject({
      operation: "publish_facebook_carousel", calls: 1,
    });
    expect((await run("2026-11-12T12:05:02.000Z")).result).toMatchObject({
      operation: "confirm_facebook_media", calls: 1, status: "published",
    });
    expect(operations).toEqual([
      "create_facebook_carousel_child:0",
      "create_facebook_carousel_child:1",
      "publish_facebook_carousel:parent",
      "confirm_facebook_media:parent",
    ]);
    expect(performOperation).toHaveBeenCalledTimes(4);
  });

  it("keeps Reels manual with zero state changes and zero Meta calls", async () => {
    const state = harness();
    const performOperation = vi.fn();
    const outcome = await advanceStudioPublication({
      occurrence: "test-001",
      item: item("reel"),
      stored: state.current,
      allowedPlatforms: ["instagram"],
      now: new Date("2026-11-12T12:00:00.000Z"),
      save: state.save,
      consumeAuthorization: state.consumeAuthorization,
      pauseBrand: state.pauseBrand,
      performOperation,
    });

    expect(outcome.result).toMatchObject({ status: "manual-only", calls: 0 });
    expect(performOperation).not.toHaveBeenCalled();
    expect(state.save).not.toHaveBeenCalled();
  });

  it.each([
    "2026-11-11T15:00:00.000Z",
    "2026-11-13T15:00:00.000Z",
  ])("never calls Meta outside the exact publication day (%s)", async (now) => {
    const state = harness();
    const performOperation = vi.fn();
    const outcome = await advanceStudioPublication({
      occurrence: "test-001",
      item: item(),
      stored: state.current,
      allowedPlatforms: ["instagram"],
      now: new Date(now),
      save: state.save,
      consumeAuthorization: state.consumeAuthorization,
      pauseBrand: state.pauseBrand,
      performOperation,
    });

    expect(outcome.result).toMatchObject({ status: "outside-publication-day", calls: 0 });
    expect(performOperation).not.toHaveBeenCalled();
    expect(state.save).not.toHaveBeenCalled();
  });

  it("checks a slow container at most three times with increasing waits and no loop", async () => {
    const initial = stored();
    initial.state.instagram.status = "waiting_for_media";
    initial.state.instagram.containerId = "container";
    const state = harness(initial);
    const performOperation = vi.fn(async () => ok({ id: null, statusCode: "IN_PROGRESS" }));
    const run = (now: string) => advanceStudioPublication({
      occurrence: "test-001",
      item: item(),
      stored: state.current,
      allowedPlatforms: ["instagram"],
      now: new Date(now),
      save: state.save,
      consumeAuthorization: state.consumeAuthorization,
      pauseBrand: state.pauseBrand,
      performOperation,
    });

    expect((await run("2026-11-12T12:00:00.000Z")).result.calls).toBe(1);
    expect(state.current.state.instagram.nextActionAt).toBe("2026-11-12T12:05:00.000Z");
    expect((await run("2026-11-12T12:01:00.000Z")).result.calls).toBe(0);
    expect((await run("2026-11-12T12:05:00.000Z")).result.calls).toBe(1);
    expect(state.current.state.instagram.nextActionAt).toBe("2026-11-12T12:20:00.000Z");
    expect((await run("2026-11-12T12:20:00.000Z")).result.calls).toBe(1);
    expect(state.current.state.instagram.status).toBe("needs_review");
    expect(performOperation).toHaveBeenCalledTimes(3);
  });

  it("pauses the brand after one critical Meta error and performs no retry", async () => {
    const state = harness();
    const performOperation = vi.fn(async () => {
      throw new MetaPublishingError("Application request limit reached", "brand-critical", { httpStatus: 429, code: 4 });
    });
    const outcome = await advanceStudioPublication({
      occurrence: "test-001",
      item: item(),
      stored: state.current,
      allowedPlatforms: ["instagram"],
      now: new Date("2026-11-12T12:00:00.000Z"),
      save: state.save,
      consumeAuthorization: state.consumeAuthorization,
      pauseBrand: state.pauseBrand,
      performOperation,
    });

    expect(outcome.result).toMatchObject({ status: "needs-review", calls: 1 });
    expect(performOperation).toHaveBeenCalledTimes(1);
    expect(state.pauseBrand).toHaveBeenCalledTimes(1);
  });

  it("does nothing when no platform was explicitly authorized", async () => {
    const state = harness();
    const performOperation = vi.fn();
    const outcome = await advanceStudioPublication({
      occurrence: "test-001",
      item: item(),
      stored: state.current,
      allowedPlatforms: [],
      now: new Date("2026-11-12T12:00:00.000Z"),
      save: state.save,
      consumeAuthorization: state.consumeAuthorization,
      pauseBrand: state.pauseBrand,
      performOperation,
    });

    expect(outcome.result).toMatchObject({ status: "platform-not-authorized", calls: 0 });
    expect(performOperation).not.toHaveBeenCalled();
    expect(state.save).not.toHaveBeenCalled();
  });
});
