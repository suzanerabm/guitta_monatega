import { describe, expect, it } from "vitest";
import { selectDuePublications } from "./select-due";
import type { PublicationItem } from "./types";

const item = (occurrence: string, scheduledAt: string): PublicationItem => ({
  occurrence,
  postId: occurrence,
  scheduledAt,
  world: "zeco",
  type: "scene",
  media: { kind: "image", image: { url: "https://example.com/image.png" } },
  instagram: { caption: "caption" },
  facebook: { message: "message" },
});

describe("Bichittos schedule", () => {
  it("does not select a future publication", () => {
    const future = item("001", "2026-10-20T19:30:00-03:00");
    expect(selectDuePublications([future], new Date("2026-10-20T22:29:59Z"))).toEqual([]);
  });

  it("selects the earliest publication whose exact time has arrived", () => {
    const first = item("001", "2026-10-20T19:30:00-03:00");
    const second = item("002", "2026-10-20T20:30:00-03:00");
    expect(selectDuePublications([first, second], new Date("2026-10-20T22:30:00Z"))).toEqual([first]);
  });

  it("returns null after the queue is exhausted", () => {
    expect(selectDuePublications([], new Date("2028-01-01T00:00:00Z"))).toEqual([]);
  });
});
