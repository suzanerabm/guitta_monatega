import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as bichittos from "./bichittos-social/meta";
import * as studio from "./guitta-studio-social/meta";
import * as kammara from "./kammara-social/meta";

// Garante a política pós-incidente de 15/10/2026: nenhuma chamada à Meta é repetida
// e cada execução respeita um teto fixo de chamadas.

type Item = Parameters<typeof kammara.publishers.instagram>[0];

const brands = [
  { name: "Kammara", prefix: "KAMMARA", module: kammara },
  { name: "Bichittos", prefix: "BICHITTOS", module: bichittos as unknown as typeof kammara },
  { name: "Studio", prefix: "GUITTA_STUDIO", module: studio as unknown as typeof kammara },
];

const image = (): Item => ({
  occurrence: "001", scheduledAt: "2026-10-20T09:00:00-03:00", discovery: 1, slug: "test", type: "post",
  media: { kind: "image", image: { url: "https://example.com/1.png" } },
  instagram: { caption: "caption" }, facebook: { message: "message" },
} as Item);

const carousel = (count: number): Item => ({
  ...image(),
  media: { kind: "carousel", images: Array.from({ length: count }, (_, index) => ({ url: `https://example.com/${index}.png` })) },
} as Item);

type Call = { method: string; path: string; fields: string | null };

function metaMock(options: { statusCode?: string; failOn?: (call: Call) => boolean; failMessage?: string } = {}) {
  const calls: Call[] = [];
  let sequence = 0;
  const fetchMock = vi.fn(async (input: string | URL, init?: RequestInit) => {
    const url = new URL(String(input));
    const call = { method: init?.method ?? "GET", path: url.pathname, fields: url.searchParams.get("fields") };
    calls.push(call);
    const reply = (body: object, status = 200) => new Response(JSON.stringify(body), { status });
    if (options.failOn?.(call)) return reply({ error: { message: options.failMessage ?? "simulated Meta error" } }, 400);
    if (call.fields === "status_code,status") return reply({ status_code: options.statusCode ?? "FINISHED" });
    if (call.fields === "id,access_token") return reply({ id: "page", access_token: "page-token" });
    if (call.fields === "id") return reply({ id: url.pathname.split("/").pop() });
    sequence += 1;
    if (call.path.endsWith("/photos")) return reply({ id: `photo${sequence}`, post_id: `post${sequence}` });
    return reply({ id: `id${sequence}` });
  });
  vi.stubGlobal("fetch", fetchMock);
  return calls;
}

async function settle<T>(promise: Promise<T>): Promise<T | Error> {
  const outcome = promise.catch((error: Error) => error);
  await vi.runAllTimersAsync();
  return outcome;
}

describe.each(brands)("$name Meta publisher call budget", ({ prefix, module }) => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubEnv(`${prefix}_META_GRAPH_API_VERSION`, "v23.0");
    vi.stubEnv(`${prefix}_META_ACCESS_TOKEN`, "user-token");
    vi.stubEnv(`${prefix}_INSTAGRAM_USER_ID`, "ig");
    vi.stubEnv(`${prefix}_FACEBOOK_PAGE_ID`, "page");
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("publishes an Instagram image with exactly four calls and a single status check", async () => {
    const calls = metaMock();
    const result = await settle(module.publishers.instagram(image()));
    expect(result).not.toBeInstanceOf(Error);
    expect(calls).toHaveLength(4);
    expect(calls.filter((call) => call.fields === "status_code,status")).toHaveLength(1);
  });

  it("stops after one status check when the container is not ready", async () => {
    const calls = metaMock({ statusCode: "IN_PROGRESS" });
    const result = await settle(module.publishers.instagram(image()));
    expect(result).toBeInstanceOf(Error);
    expect((result as Error).message).toContain("no retry");
    expect(calls).toHaveLength(2);
    expect(calls.some((call) => call.path.endsWith("/media_publish"))).toBe(false);
  });

  it("never retries media_publish", async () => {
    // mensagem que disparava as 6 tentativas no publicador anterior
    const calls = metaMock({ failOn: (call) => call.path.endsWith("/media_publish"), failMessage: "media is not ready for publishing" });
    const result = await settle(module.publishers.instagram(image()));
    expect(result).toBeInstanceOf(Error);
    expect(calls.filter((call) => call.path.endsWith("/media_publish"))).toHaveLength(1);
  });

  it("stops on the first Meta error", async () => {
    const calls = metaMock({ failOn: () => true });
    const result = await settle(module.publishers.instagram(image()));
    expect(result).toBeInstanceOf(Error);
    expect(calls).toHaveLength(1);
  });

  it("checks each carousel container exactly once", async () => {
    const calls = metaMock();
    const result = await settle(module.publishers.instagram(carousel(3)));
    expect(result).not.toBeInstanceOf(Error);
    expect(calls).toHaveLength(module.instagramCallLimit(carousel(3)));
    expect(calls.filter((call) => call.fields === "status_code,status")).toHaveLength(4);
  });

  it("keeps the largest carousel within a fixed ceiling", () => {
    expect(module.instagramCallLimit(carousel(10))).toBe(24);
    expect(module.facebookCallLimit(carousel(10))).toBe(13);
  });

  it("publishes a Facebook photo with exactly three calls", async () => {
    const calls = metaMock();
    const result = await settle(module.publishers.facebook(image()));
    expect(result).not.toBeInstanceOf(Error);
    expect(calls).toHaveLength(3);
  });

  it("does not retry a failed Facebook publication", async () => {
    const calls = metaMock({ failOn: (call) => call.path.endsWith("/photos") });
    const result = await settle(module.publishers.facebook(image()));
    expect(result).toBeInstanceOf(Error);
    expect(calls.filter((call) => call.path.endsWith("/photos"))).toHaveLength(1);
  });
});
