import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MetaPublishingError } from "@/lib/social-meta/client";
import { performStudioMetaOperation } from "./meta";
import type { MetaOperation, PlatformState, PublicationItem } from "./types";

const publication: PublicationItem = {
  occurrence: "test-001",
  postId: "studio-test-001",
  scheduledAt: "2026-11-12T09:00:00-03:00",
  world: "studio",
  type: "test",
  media: { kind: "image", image: { url: "https://media.example/test.jpg" } },
  instagram: { caption: "Safe test" },
  facebook: { message: "Safe test" },
};

const carouselPublication: PublicationItem = {
  ...publication,
  media: {
    kind: "carousel",
    images: [
      { url: "https://media.example/slide-1.jpg" },
      { url: "https://media.example/slide-2.jpg" },
    ],
  },
};

function state(): PlatformState {
  return {
    status: "pending",
    externalId: "published-id",
    containerId: "container-id",
    nextActionAt: null,
    statusChecks: 0,
    inFlight: null,
    carousel: null,
    error: null,
  };
}

function carouselState(): PlatformState {
  return {
    ...state(),
    status: "building_carousel",
    carousel: {
      children: [
        { status: "media_ready", containerId: "child-1", nextActionAt: null, statusChecks: 1, error: null },
        { status: "media_ready", containerId: "child-2", nextActionAt: null, statusChecks: 1, error: null },
      ],
    },
  };
}

describe("Studio single-call Meta adapter", () => {
  beforeEach(() => {
    vi.stubEnv("GUITTA_STUDIO_META_GRAPH_API_VERSION", "v23.0");
    vi.stubEnv("GUITTA_STUDIO_META_ACCESS_TOKEN", "instagram-secret");
    vi.stubEnv("GUITTA_STUDIO_INSTAGRAM_USER_ID", "instagram-id");
    vi.stubEnv("GUITTA_STUDIO_FACEBOOK_PAGE_ID", "facebook-id");
    vi.stubEnv("GUITTA_STUDIO_FACEBOOK_PAGE_ACCESS_TOKEN", "facebook-secret");
  });

  afterEach(() => vi.unstubAllEnvs());

  it.each<MetaOperation>([
    "create_instagram_container",
    "check_instagram_container",
    "publish_instagram_media",
    "confirm_instagram_media",
    "publish_facebook_image",
    "confirm_facebook_media",
  ])("performs exactly one request for %s and keeps tokens out of the URL", async (operation) => {
    const calls: Array<{ url: string; authorization: string | null }> = [];
    const fetchImpl = vi.fn(async (input: string | URL, init?: RequestInit) => {
      const url = String(input);
      calls.push({ url, authorization: new Headers(init?.headers).get("authorization") });
      const body = operation === "check_instagram_container"
        ? { status_code: "FINISHED", status: "Finished" }
        : { id: "result-id", post_id: operation === "publish_facebook_image" ? "facebook-post-id" : undefined };
      return new Response(JSON.stringify(body), { status: 200 });
    }) as unknown as typeof fetch;

    await performStudioMetaOperation({
      operation,
      carouselIndex: null,
      occurrence: "test-001",
      correlationId: "correlation",
      item: publication,
      platformState: state(),
      fetchImpl,
      log: () => {},
    });

    expect(calls).toHaveLength(1);
    expect(calls[0].url).not.toContain("access_token");
    expect(calls[0].url).not.toContain("secret");
    expect(calls[0].authorization).toMatch(/^Bearer (instagram|facebook)-secret$/);
  });

  it("stops after the first rate-limit response", async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({
      error: { message: "Application request limit reached", code: 4 },
    }), { status: 429 })) as unknown as typeof fetch;

    const outcome = performStudioMetaOperation({
      operation: "create_instagram_container",
      carouselIndex: null,
      occurrence: "test-001",
      correlationId: "correlation",
      item: publication,
      platformState: state(),
      fetchImpl,
      log: () => {},
    });

    await expect(outcome).rejects.toBeInstanceOf(MetaPublishingError);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["create_instagram_carousel_child", 0],
    ["check_instagram_carousel_child", 0],
    ["create_instagram_carousel_container", null],
    ["create_facebook_carousel_child", 0],
    ["publish_facebook_carousel", null],
  ] as const)("performs exactly one request for carousel operation %s", async (operation, carouselIndex) => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify(
      operation === "check_instagram_carousel_child"
        ? { status_code: "FINISHED", status: "Finished" }
        : { id: "result-id" },
    ), { status: 200 })) as unknown as typeof fetch;

    await performStudioMetaOperation({
      operation,
      carouselIndex,
      occurrence: "test-001",
      correlationId: "carousel-correlation",
      item: carouselPublication,
      platformState: carouselState(),
      fetchImpl,
      log: () => {},
    });

    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });
});
