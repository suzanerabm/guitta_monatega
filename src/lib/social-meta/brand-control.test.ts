import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { runBichittosPublisher } from "../bichittos-social/run";
import * as bichittosState from "../bichittos-social/state";
import { runGuittaStudioPublisher } from "../guitta-studio-social/run";
import * as studioState from "../guitta-studio-social/state";
import { runKammaraPublisher } from "../kammara-social/run";
import * as kammaraState from "../kammara-social/state";

// O interruptor da marca é verificado antes de qualquer estado de ocorrência ou chamada à Meta,
// e o padrão sem objeto é desligado.

const brands = [
  { name: "Kammara", prefix: "KAMMARA", key: "publications/kammara/_control.json", state: kammaraState, run: runKammaraPublisher, due: "2026-10-11T08:00:00-03:00" },
  { name: "Bichittos", prefix: "BICHITTOS", key: "publications/bichittos/_control.json", state: bichittosState, run: runBichittosPublisher, due: "2026-10-10T09:00:00-03:00" },
  { name: "Studio", prefix: "GUITTA_STUDIO", key: "publications/guitta-monatega-studio/_control.json", state: studioState, run: runGuittaStudioPublisher, due: "2026-10-10T09:00:00-03:00" },
];

type Command = { input: { Key?: string; Body?: string; IfMatch?: string } };

describe.each(brands)("$name brand control", ({ prefix, key, state, run, due }) => {
  let send: ReturnType<typeof vi.spyOn>;
  let fetchSpy: ReturnType<typeof vi.fn>;
  let stored: string | null;

  beforeEach(() => {
    vi.stubEnv(`${prefix}_AUTOMATION_BUCKET`, "bucket");
    stored = null;
    send = vi.spyOn(S3Client.prototype, "send").mockImplementation((async (command: Command) => {
      if (command.input.Key !== key) throw new Error(`unexpected S3 access to ${command.input.Key}`);
      if (command instanceof PutObjectCommand) {
        stored = String(command.input.Body);
        return { ETag: "etag" };
      }
      if (stored === null) throw Object.assign(new Error("missing"), { name: "NoSuchKey" });
      return { Body: { transformToString: async () => stored }, ETag: "etag" };
    }) as never);
    fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
  });

  afterEach(() => {
    send.mockRestore();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("is off when the control object does not exist", async () => {
    expect((await state.readBrandControl()).publishingEnabled).toBe(false);
  });

  it("stays off unless publishingEnabled is exactly true", async () => {
    stored = JSON.stringify({ publishingEnabled: "true" });
    expect((await state.readBrandControl()).publishingEnabled).toBe(false);
  });

  it("returns before touching occurrence state or Meta while paused", async () => {
    const result = await run(new Date(due));
    expect(result).toMatchObject({ status: "brand-paused" });
    expect(send).toHaveBeenCalledTimes(1);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("requires a scoped, expiring manual authorization before Studio can touch occurrence state", async () => {
    if (prefix !== "GUITTA_STUDIO") return;
    stored = JSON.stringify({ publishingEnabled: true });
    const result = await run(new Date(due));
    expect(result).toMatchObject({ status: "manual-authorization-required", calls: 0 });
    expect(send).toHaveBeenCalledTimes(1);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("rejects an expired Studio authorization before touching occurrence state", async () => {
    if (prefix !== "GUITTA_STUDIO") return;
    stored = JSON.stringify({
      publishingEnabled: true,
      allowedOccurrence: "001",
      allowedPlatforms: ["instagram"],
      allowedOperation: "create_instagram_container",
      authorizationExpiresAt: "2026-10-10T11:59:59.000Z",
    });
    const result = await run(new Date(due));
    expect(result).toMatchObject({ status: "manual-authorization-expired", calls: 0 });
    expect(send).toHaveBeenCalledTimes(1);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("rejects a Studio authorization longer than 24 hours", async () => {
    if (prefix !== "GUITTA_STUDIO") return;
    stored = JSON.stringify({
      publishingEnabled: true,
      allowedOccurrence: "001",
      allowedPlatforms: ["instagram"],
      allowedOperation: "create_instagram_container",
      authorizationExpiresAt: "2026-10-12T12:00:00.000Z",
    });
    const result = await run(new Date(due));
    expect(result).toMatchObject({ status: "manual-authorization-expired", calls: 0 });
    expect(send).toHaveBeenCalledTimes(1);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("records a system pause with its reason", async () => {
    await state.pauseBrand("instagram: Invalid OAuth access token", new Date("2026-10-20T12:00:00Z"));
    expect(JSON.parse(stored!)).toMatchObject({
      publishingEnabled: false,
      pauseReason: "instagram: Invalid OAuth access token",
      pausedAt: "2026-10-20T12:00:00.000Z",
      pausedBy: "system",
    });
    if (prefix === "GUITTA_STUDIO") {
      expect(JSON.parse(stored!)).toMatchObject({
        allowedOccurrence: null,
        allowedPlatforms: [],
        allowedOperation: null,
        authorizationExpiresAt: null,
      });
    }
    expect((await state.readBrandControl()).publishingEnabled).toBe(false);
  });

  it("atomically consumes the Studio authorization before a Meta call", async () => {
    if (prefix !== "GUITTA_STUDIO") return;
    stored = JSON.stringify({
      publishingEnabled: true,
      allowedOccurrence: "test-001",
      allowedPlatforms: ["instagram"],
      allowedOperation: "create_instagram_container",
      authorizationExpiresAt: "2026-11-12T13:00:00.000Z",
    });

    await studioState.consumeBrandAuthorization({
      occurrence: "test-001",
      platform: "instagram",
      operation: "create_instagram_container",
      carouselIndex: null,
      correlationId: "correlation-1",
    }, new Date("2026-11-12T12:00:00.000Z"));

    expect(JSON.parse(stored!)).toMatchObject({
      publishingEnabled: false,
      allowedOccurrence: null,
      allowedPlatforms: [],
      allowedOperation: null,
      authorizationExpiresAt: null,
      pausedBy: "system",
    });
    expect(JSON.parse(stored!).pauseReason).toContain("create_instagram_container");
    const put = send.mock.calls[1][0] as Command;
    expect(put.input.IfMatch).toBe("etag");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("refuses to consume a Studio authorization for a different operation", async () => {
    if (prefix !== "GUITTA_STUDIO") return;
    stored = JSON.stringify({
      publishingEnabled: true,
      allowedOccurrence: "test-001",
      allowedPlatforms: ["instagram"],
      allowedOperation: "create_instagram_container",
      authorizationExpiresAt: "2026-11-12T13:00:00.000Z",
    });

    await expect(studioState.consumeBrandAuthorization({
      occurrence: "test-001",
      platform: "instagram",
      operation: "publish_instagram_media",
      carouselIndex: null,
      correlationId: "correlation-2",
    }, new Date("2026-11-12T12:00:00.000Z"))).rejects.toThrow("does not match");

    expect(send).toHaveBeenCalledTimes(1);
    expect(JSON.parse(stored!).publishingEnabled).toBe(true);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("refuses to consume a Studio carousel authorization for a different slide", async () => {
    if (prefix !== "GUITTA_STUDIO") return;
    stored = JSON.stringify({
      publishingEnabled: true,
      allowedOccurrence: "test-001",
      allowedPlatforms: ["instagram"],
      allowedOperation: "create_instagram_carousel_child",
      allowedCarouselIndex: 0,
      authorizationExpiresAt: "2026-11-12T13:00:00.000Z",
    });

    await expect(studioState.consumeBrandAuthorization({
      occurrence: "test-001",
      platform: "instagram",
      operation: "create_instagram_carousel_child",
      carouselIndex: 1,
      correlationId: "correlation-3",
    }, new Date("2026-11-12T12:00:00.000Z"))).rejects.toThrow("does not match");

    expect(send).toHaveBeenCalledTimes(1);
    expect(JSON.parse(stored!).publishingEnabled).toBe(true);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
