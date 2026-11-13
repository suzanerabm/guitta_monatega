import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  consumeStudioScheduleAuthorization,
  readStudioScheduleControl,
  STUDIO_SCHEDULE_MAX_META_CALLS_PER_DAY,
} from "./state";
import type { PublicationItem } from "./types";

const key = "publications/guitta-monatega-studio/_schedule-control.json";
type Command = { input: { Key?: string; Body?: string; IfMatch?: string; IfNoneMatch?: string } };

const item: PublicationItem = {
  occurrence: "006",
  postId: "studio-006",
  scheduledAt: "2026-11-14T09:00:00-03:00",
  world: "zeco",
  type: "character",
  media: { kind: "image", image: { url: "https://example.com/ninha.png" } },
  instagram: { caption: "Ninha" },
  facebook: { message: "Ninha" },
};

describe("Studio schedule circuit breaker", () => {
  let stored: string | null;
  let send: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.stubEnv("GUITTA_STUDIO_AUTOMATION_BUCKET", "bucket");
    stored = null;
    send = vi.spyOn(S3Client.prototype, "send").mockImplementation((async (command: Command) => {
      if (command.input.Key !== key) throw new Error(`unexpected S3 access to ${command.input.Key}`);
      if (command instanceof PutObjectCommand) {
        stored = String(command.input.Body);
        return { ETag: "next-etag" };
      }
      if (stored === null) throw Object.assign(new Error("missing"), { name: "NoSuchKey" });
      return { Body: { transformToString: async () => stored }, ETag: "etag" };
    }) as never);
  });

  afterEach(() => {
    send.mockRestore();
    vi.unstubAllEnvs();
  });

  it("is disabled when its S3 object does not exist", async () => {
    await expect(readStudioScheduleControl()).resolves.toMatchObject({ enabled: false, callsToday: 0 });
  });

  it("conditionally reserves one daily call before Meta", async () => {
    stored = JSON.stringify({
      schemaVersion: 1,
      enabled: true,
      allowedPlatforms: ["instagram", "facebook"],
      callsDate: "2026-11-14",
      callsToday: 0,
    });

    await consumeStudioScheduleAuthorization({
      occurrence: "006",
      platform: "instagram",
      operation: "create_instagram_container",
      carouselIndex: null,
      correlationId: "correlation-1",
    }, item, new Date("2026-11-14T12:00:00.000Z"));

    expect(JSON.parse(stored!)).toMatchObject({
      enabled: true,
      callsDate: "2026-11-14",
      callsToday: 1,
      lastAuthorization: {
        occurrence: "006",
        operation: "create_instagram_container",
        correlationId: "correlation-1",
      },
    });
    const put = send.mock.calls[1][0] as Command;
    expect(put.input.IfMatch).toBe("etag");
  });

  it("refuses a publication from another calendar date before S3", async () => {
    await expect(consumeStudioScheduleAuthorization({
      occurrence: "006",
      platform: "instagram",
      operation: "create_instagram_container",
      carouselIndex: null,
      correlationId: "correlation-2",
    }, item, new Date("2026-11-15T12:00:00.000Z"))).rejects.toThrow("today's exact occurrence");

    expect(send).not.toHaveBeenCalled();
  });

  it("authorizes Facebook only when it is explicitly listed", async () => {
    stored = JSON.stringify({
      schemaVersion: 1,
      enabled: true,
      allowedPlatforms: ["instagram", "facebook"],
      callsDate: "2026-11-14",
      callsToday: 1,
    });

    await consumeStudioScheduleAuthorization({
      occurrence: "006",
      platform: "facebook",
      operation: "publish_facebook_image",
      carouselIndex: null,
      correlationId: "correlation-3",
    }, item, new Date("2026-11-14T12:00:00.000Z"));

    expect(JSON.parse(stored!)).toMatchObject({
      allowedPlatforms: ["instagram", "facebook"],
      callsToday: 2,
      lastAuthorization: { occurrence: "006", operation: "publish_facebook_image" },
    });
  });

  it("refuses Facebook when the persistent allowlist contains only Instagram", async () => {
    stored = JSON.stringify({
      schemaVersion: 1,
      enabled: true,
      allowedPlatforms: ["instagram"],
      callsDate: "2026-11-14",
      callsToday: 0,
    });

    await expect(consumeStudioScheduleAuthorization({
      occurrence: "006",
      platform: "facebook",
      operation: "publish_facebook_image",
      carouselIndex: null,
      correlationId: "correlation-4",
    }, item, new Date("2026-11-14T12:00:00.000Z"))).rejects.toThrow("not authorized for facebook");

    expect(send).toHaveBeenCalledTimes(1);
  });

  it("refuses any call beyond the fixed daily ceiling", async () => {
    stored = JSON.stringify({
      schemaVersion: 1,
      enabled: true,
      allowedPlatforms: ["instagram", "facebook"],
      callsDate: "2026-11-14",
      callsToday: STUDIO_SCHEDULE_MAX_META_CALLS_PER_DAY,
    });

    await expect(consumeStudioScheduleAuthorization({
      occurrence: "006",
      platform: "instagram",
      operation: "create_instagram_container",
      carouselIndex: null,
      correlationId: "correlation-5",
    }, item, new Date("2026-11-14T12:00:00.000Z"))).rejects.toThrow("daily Meta call limit");

    expect(send).toHaveBeenCalledTimes(1);
  });
});
