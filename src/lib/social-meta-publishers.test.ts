import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { publishers as bichittos } from "./bichittos-social/meta";
import { publishers as kammara } from "./kammara-social/meta";
import { publishPlatforms } from "./social-meta/execute";
import { facebookCallLimit, instagramCallLimit, type PublishableItem } from "./social-meta/publishers";

// Regression coverage for the paused legacy Kammara and Bichittos publishers. Studio has a
// stricter one-call state machine covered by guitta-studio-social/safe-publisher.test.ts.

const brands = [
  { name: "Kammara", prefix: "KAMMARA", publishers: kammara },
  { name: "Bichittos", prefix: "BICHITTOS", publishers: bichittos },
];

const image = (): PublishableItem => ({
  media: { kind: "image", image: { url: "https://example.com/1.png" } },
  instagram: { caption: "caption" },
  facebook: { message: "message" },
});

const carousel = (count: number): PublishableItem => ({
  ...image(),
  media: { kind: "carousel", images: Array.from({ length: count }, (_, index) => ({ url: `https://example.com/${index}.png` })) },
});

type Call = { method: string; path: string; fields: string | null; authorization: string | null };
type MockOptions = {
  statusCode?: string;
  failOn?: (call: Call) => boolean;
  failStatus?: number;
  failError?: object;
  usageOn?: (call: Call) => number | undefined;
};

function metaMock(options: MockOptions = {}) {
  const calls: Call[] = [];
  let sequence = 0;
  const fetchImpl = vi.fn(async (input: string | URL, init?: RequestInit) => {
    const url = new URL(String(input));
    const call = {
      method: init?.method ?? "GET",
      path: url.pathname,
      fields: url.searchParams.get("fields"),
      authorization: new Headers(init?.headers).get("authorization"),
    };
    calls.push(call);
    const usage = options.usageOn?.(call);
    const headers: Record<string, string> = usage === undefined ? {} : { "x-app-usage": JSON.stringify({ call_count: usage }) };
    const reply = (body: object, status = 200) => new Response(JSON.stringify(body), { status, headers });
    if (options.failOn?.(call)) return reply({ error: options.failError ?? { message: "simulated Meta error", code: 100 } }, options.failStatus ?? 400);
    if (call.fields === "status_code,status") return reply({ status_code: options.statusCode ?? "FINISHED" });
    sequence += 1;
    if (call.path.endsWith("/photos")) return reply({ id: `photo${sequence}`, post_id: `post${sequence}` });
    return reply({ id: `id${sequence}` });
  });
  return { calls, fetchImpl: fetchImpl as unknown as typeof fetch };
}

const freshState = () => ({
  state: {
    instagram: { status: "pending" as const, externalId: null, error: null },
    facebook: { status: "pending" as const, externalId: null, error: null },
  },
});

async function run(publishers: typeof kammara, item: PublishableItem, mock: ReturnType<typeof metaMock>) {
  const pauseBrand = vi.fn(async () => {});
  const outcome = publishPlatforms({
    brand: "test",
    occurrence: "001",
    item,
    stored: freshState(),
    save: async (stored) => stored,
    publishers,
    pauseBrand,
    fetchImpl: mock.fetchImpl,
    log: () => {},
  }).catch((error: Error) => error);
  await vi.runAllTimersAsync();
  return { result: await outcome, pauseBrand };
}

describe.each(brands)("$name Meta publisher", ({ prefix, publishers }) => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubEnv(`${prefix}_META_GRAPH_API_VERSION`, "v23.0");
    vi.stubEnv(`${prefix}_META_ACCESS_TOKEN`, "user-token");
    vi.stubEnv(`${prefix}_INSTAGRAM_USER_ID`, "ig");
    vi.stubEnv(`${prefix}_FACEBOOK_PAGE_ID`, "page");
    vi.stubEnv(`${prefix}_FACEBOOK_PAGE_ACCESS_TOKEN`, "page-token");
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  it("publishes an image on both platforms with four calls in total", async () => {
    const mock = metaMock();
    const { result, pauseBrand } = await run(publishers, image(), mock);
    expect(result).toMatchObject({ pausedReason: null, stored: { state: { instagram: { status: "published" }, facebook: { status: "published" } } } });
    expect(mock.calls).toHaveLength(4);
    expect(mock.calls.filter((call) => call.fields === "status_code,status")).toHaveLength(1);
    expect(mock.calls.at(-1)?.authorization).toBe("Bearer page-token");
    expect(pauseBrand).not.toHaveBeenCalled();
  });

  it("stops after one status check when the container is not ready, without pausing the brand", async () => {
    const mock = metaMock({ statusCode: "IN_PROGRESS" });
    const { result, pauseBrand } = await run(publishers, image(), mock);
    expect(result).toBeInstanceOf(Error);
    expect((result as Error).message).toContain("no retry");
    expect(mock.calls).toHaveLength(2);
    expect(mock.calls.some((call) => call.path.endsWith("/media_publish") || call.path.endsWith("/photos"))).toBe(false);
    expect(pauseBrand).not.toHaveBeenCalled();
  });

  it("never retries media_publish", async () => {
    // mensagem que disparava as 6 tentativas no publicador anterior
    const mock = metaMock({ failOn: (call) => call.path.endsWith("/media_publish"), failError: { message: "media is not ready for publishing", code: 9007 } });
    const { result } = await run(publishers, image(), mock);
    expect(result).toBeInstanceOf(Error);
    expect(mock.calls.filter((call) => call.path.endsWith("/media_publish"))).toHaveLength(1);
  });

  it.each([
    ["an invalid token", 400, { message: "Invalid OAuth access token", code: 190 }],
    ["a permission error", 403, { message: "Permissions error", code: 200 }],
    ["a rate limit", 429, { message: "Application request limit reached", code: 4 }],
    ["a policy block", 400, { message: "Temporarily blocked", code: 368 }],
  ])("pauses the brand after %s, with a single call", async (_label, status, error) => {
    const mock = metaMock({ failOn: () => true, failStatus: status, failError: error });
    const { result, pauseBrand } = await run(publishers, image(), mock);
    expect(result).toBeInstanceOf(Error);
    expect(mock.calls).toHaveLength(1);
    expect(pauseBrand).toHaveBeenCalledTimes(1);
  });

  it("keeps a successful post but pauses the brand when Meta reports high usage", async () => {
    const mock = metaMock({ usageOn: (call) => (call.path.endsWith("/media_publish") ? 75 : 5) });
    const { result, pauseBrand } = await run(publishers, image(), mock);
    expect(result).toMatchObject({ stored: { state: { instagram: { status: "published" }, facebook: { status: "pending" } } } });
    expect((result as { pausedReason: string }).pausedReason).toMatch(/75%/);
    expect(mock.calls).toHaveLength(3);
    expect(pauseBrand).toHaveBeenCalledTimes(1);
  });

  it("checks each carousel container exactly once", async () => {
    const mock = metaMock();
    const { result } = await run(publishers, carousel(3), mock);
    expect(result).not.toBeInstanceOf(Error);
    expect(mock.calls).toHaveLength(instagramCallLimit(carousel(3)) + facebookCallLimit(carousel(3)));
    expect(mock.calls.filter((call) => call.fields === "status_code,status")).toHaveLength(4);
  });

  it("does not retry a failed Facebook publication", async () => {
    const mock = metaMock({ failOn: (call) => call.path.endsWith("/photos") });
    const { result } = await run(publishers, image(), mock);
    expect(result).toBeInstanceOf(Error);
    expect(mock.calls.filter((call) => call.path.endsWith("/photos"))).toHaveLength(1);
  });
});

describe("brand isolation", () => {
  afterEach(() => { vi.useRealTimers(); vi.unstubAllEnvs(); });

  it("never uses another brand's credentials", async () => {
    vi.useFakeTimers();
    for (const name of ["META_GRAPH_API_VERSION", "META_ACCESS_TOKEN", "INSTAGRAM_USER_ID", "FACEBOOK_PAGE_ID", "FACEBOOK_PAGE_ACCESS_TOKEN"]) {
      vi.stubEnv(`KAMMARA_${name}`, "kammara-value");
      vi.stubEnv(`BICHITTOS_${name}`, "");
    }
    const mock = metaMock();
    const { result } = await run(bichittos, image(), mock);
    expect((result as Error).message).toMatch(/BICHITTOS_.* is not configured/);
    expect(mock.calls).toHaveLength(0);
  });
});

describe("call ceilings", () => {
  it("keeps the largest carousel within a fixed ceiling", () => {
    expect(instagramCallLimit(carousel(10))).toBe(23);
    expect(facebookCallLimit(carousel(10))).toBe(11);
    expect(instagramCallLimit(image())).toBe(3);
    expect(facebookCallLimit(image())).toBe(1);
  });
});
