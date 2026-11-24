import { describe, expect, it } from "vitest";
import { selectDuePublications } from "./select-due";
import type { PublicationItem } from "./types";

function item(occurrence: string, scheduledAt: string): PublicationItem {
  return {
    occurrence,
    postId: `studio-${occurrence}`,
    scheduledAt,
    world: "studio",
    type: "test",
    media: { kind: "image", image: { url: "https://media.example/test.jpg" } },
    instagram: { caption: "Test" },
    facebook: { message: "Test" },
  };
}

describe("Studio publication day selection", () => {
  const items = [
    item("past", "2026-11-12T09:00:00-03:00"),
    item("today", "2026-11-13T09:00:00-03:00"),
    item("later-today", "2026-11-13T18:00:00-03:00"),
    item("future", "2026-11-14T09:00:00-03:00"),
  ];

  it("selects only today's post after its scheduled time", () => {
    expect(selectDuePublications(items, new Date("2026-11-13T15:00:00.000Z"))).toMatchObject([
      { occurrence: "today" },
    ]);
  });

  it("never catches up a past post and never anticipates a future post", () => {
    expect(selectDuePublications(items, new Date("2026-11-14T11:59:00.000Z"))).toEqual([]);
  });

  it("uses the Sao Paulo calendar date at UTC boundaries", () => {
    const midnightBoundary = [
      item("local-yesterday", "2026-11-13T23:00:00-03:00"),
      item("local-today", "2026-11-14T00:00:00-03:00"),
    ];
    expect(selectDuePublications(midnightBoundary, new Date("2026-11-14T03:05:00.000Z"))).toMatchObject([
      { occurrence: "local-today" },
    ]);
  });
});
