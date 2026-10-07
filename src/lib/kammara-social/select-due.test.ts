import { describe, expect, it } from "vitest";
import { saoPauloDate, selectDuePublication } from "./select-due";
import type { PublicationItem } from "./types";

const item = (scheduledAt: string): PublicationItem => ({
  occurrence: "001", scheduledAt, discovery: 1, slug: "welcome", type: "welcome",
  media: { kind: "image", image: { url: "https://example.com/image.png" } },
  instagram: { caption: "caption" }, facebook: { message: "message" },
});

describe("Kammara schedule", () => {
  it("uses the Sao Paulo calendar date", () => {
    expect(saoPauloDate(new Date("2026-10-21T01:00:00Z"))).toBe("2026-10-20");
  });

  it("selects only the occurrence scheduled for today", () => {
    const expected = item("2026-10-20T19:30:00-03:00");
    expect(selectDuePublication([expected], new Date("2026-10-20T22:30:00Z"))).toBe(expected);
    expect(selectDuePublication([expected], new Date("2026-10-21T22:30:00Z"))).toBeNull();
  });
});
