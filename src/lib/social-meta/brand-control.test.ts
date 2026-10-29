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

type Command = { input: { Key?: string; Body?: string } };

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
      return { Body: { transformToString: async () => stored } };
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

  it("records a system pause with its reason", async () => {
    await state.pauseBrand("instagram: Invalid OAuth access token", new Date("2026-10-20T12:00:00Z"));
    expect(JSON.parse(stored!)).toEqual({
      publishingEnabled: false,
      pauseReason: "instagram: Invalid OAuth access token",
      pausedAt: "2026-10-20T12:00:00.000Z",
      pausedBy: "system",
    });
    expect((await state.readBrandControl()).publishingEnabled).toBe(false);
  });
});
