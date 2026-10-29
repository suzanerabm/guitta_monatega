import { afterEach, describe, expect, it, vi } from "vitest";
import { CALL_TIMEOUT_MS, classifyMetaError, MetaClient, MetaPublishingError, peakUsage, type MetaCallLog } from "./client";

const client = (fetchImpl: typeof fetch, limit = 3, log: (entry: MetaCallLog) => void = () => {}) =>
  new MetaClient({ brand: "test", occurrence: "001", platform: "instagram", limit, correlationId: "corr", fetchImpl, log });

const ok = (body: object = { id: "1" }, headers: Record<string, string> = {}) => new Response(JSON.stringify(body), { status: 200, headers });
const fail = (status: number, error: object) => new Response(JSON.stringify({ error }), { status });

afterEach(() => { vi.useRealTimers(); });

describe("classifyMetaError", () => {
  it.each([
    [401, {}], [403, {}], [429, {}],
    [400, { code: 190 }], [400, { code: 102 }], [400, { code: 10 }], [400, { code: 200 }], [400, { code: 299 }],
    [400, { code: 4 }], [400, { code: 17 }], [400, { code: 32 }], [400, { code: 613 }], [400, { code: 368 }], [400, { code: 80002 }],
    [400, { code: 9, error_subcode: 2207042 }], [400, { code: 9, error_subcode: 2207051 }],
  ])("treats HTTP %i %j as brand-critical", (status, error) => {
    expect(classifyMetaError(status, error)).toBe("brand-critical");
  });

  it.each([[400, { code: 100 }], [500, { code: 1 }], [503, { code: 2 }], [400, {}]])("treats HTTP %i %j as needs-review", (status, error) => {
    expect(classifyMetaError(status, error)).toBe("needs-review");
  });
});

describe("peakUsage", () => {
  it("reads the highest percentage from app and business usage headers", () => {
    const headers = new Headers({
      "x-app-usage": JSON.stringify({ call_count: 12, total_cputime: 3, total_time: 8 }),
      "x-business-use-case-usage": JSON.stringify({ "123": [{ type: "instagram", call_count: 41, total_cputime: 7, total_time: 9, estimated_time_to_regain_access: 0 }] }),
    });
    expect(peakUsage(headers)).toBe(41);
  });

  it("ignores missing or unreadable headers", () => {
    expect(peakUsage(new Headers({ "x-app-usage": "not json" }))).toBe(0);
    expect(peakUsage(new Headers())).toBe(0);
  });
});

describe("MetaClient", () => {
  it("refuses the call after the budget without contacting Meta", async () => {
    const fetchImpl = vi.fn(async () => ok());
    const meta = client(fetchImpl as unknown as typeof fetch, 1);
    await meta.request("first", "https://graph.facebook.com/v23.0/a");
    await expect(meta.request("second", "https://graph.facebook.com/v23.0/b")).rejects.toThrow(/budget of 1 exhausted/);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("stops before the next call when Meta reports usage at the pause threshold", async () => {
    const fetchImpl = vi.fn(async () => ok({ id: "1" }, { "x-app-usage": JSON.stringify({ call_count: 50 }) }));
    const meta = client(fetchImpl as unknown as typeof fetch);
    await expect(meta.request("first", "https://graph.facebook.com/v23.0/a")).resolves.toEqual({ id: "1" });
    expect(meta.pauseReason).toMatch(/50%/);
    const next = meta.request("second", "https://graph.facebook.com/v23.0/b");
    await expect(next).rejects.toMatchObject({ kind: "brand-critical" });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("aborts a slow call and never retries it", async () => {
    vi.useFakeTimers();
    const fetchImpl = vi.fn((_url: string | URL, init?: RequestInit) => new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => reject(new Error("aborted")));
    }));
    const meta = client(fetchImpl as unknown as typeof fetch);
    const outcome = meta.request("slow", "https://graph.facebook.com/v23.0/a").catch((error: unknown) => error);
    await vi.advanceTimersByTimeAsync(CALL_TIMEOUT_MS);
    const error = await outcome;
    expect(error).toBeInstanceOf(MetaPublishingError);
    expect((error as MetaPublishingError).kind).toBe("needs-review");
    expect((error as Error).message).toMatch(/no retry/);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("classifies Meta errors and keeps the trace id", async () => {
    const meta = client((async () => fail(400, { message: "Invalid OAuth access token", code: 190, fbtrace_id: "trace" })) as unknown as typeof fetch);
    await expect(meta.request("create", "https://graph.facebook.com/v23.0/a")).rejects.toMatchObject({
      kind: "brand-critical",
      details: { httpStatus: 400, code: 190, traceId: "trace" },
    });
  });

  it("logs every call without the token, query string or body", async () => {
    const entries: MetaCallLog[] = [];
    const meta = client((async () => ok()) as unknown as typeof fetch, 3, (entry) => entries.push(entry));
    await meta.request("check", "https://graph.facebook.com/v23.0/123?fields=status_code&access_token=secret-token", {
      headers: { authorization: "Bearer secret-token" },
      body: "caption=private",
      method: "POST",
    });
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({ endpoint: "/v23.0/123", method: "POST", call: 1, limit: 3, httpStatus: 200, outcome: "ok" });
    expect(JSON.stringify(entries)).not.toMatch(/secret-token|private|fields=/);
  });
});
