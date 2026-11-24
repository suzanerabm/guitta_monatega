import { describe, expect, it } from "vitest";
import type { SameDayPolicy } from "./brands";
import { selectDuePublications, selectWorkItem } from "./select-due";
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

describe("per-brand same-day policy", () => {
  const minGap: SameDayPolicy = { kind: "min-gap", minGapMs: 4 * 3600_000 };
  const tz = "America/Sao_Paulo";
  const notFinished = () => false;
  const reelFinished = (candidate: PublicationItem) => candidate.media.kind === "reel";

  it("min-gap: 09:00 and 10:00 on the same day is a conflict even before 10:00", () => {
    const items = [item("021", "2026-11-13T09:00:00-03:00"), item("022", "2026-11-13T10:00:00-03:00")];
    expect(selectWorkItem(items, new Date("2026-11-13T12:30:00.000Z"), tz, minGap, notFinished)).toEqual({
      kind: "conflict",
      occurrences: ["021", "022"],
    });
  });

  it("min-gap: 09:00 and 15:00 works the earliest unfinished first", () => {
    const items = [item("022", "2026-11-13T15:00:00-03:00"), item("021", "2026-11-13T09:00:00-03:00")];
    expect(selectWorkItem(items, new Date("2026-11-13T18:30:00.000Z"), tz, minGap, notFinished)).toMatchObject({
      kind: "item",
      item: { occurrence: "021" },
    });
  });

  it("min-gap: second item starts once the first is finished", () => {
    const items = [item("021", "2026-11-13T09:00:00-03:00"), item("022", "2026-11-13T15:00:00-03:00")];
    const finished = (candidate: PublicationItem) => candidate.occurrence === "021";
    expect(selectWorkItem(items, new Date("2026-11-13T18:30:00.000Z"), tz, minGap, finished)).toMatchObject({
      kind: "item",
      item: { occurrence: "022" },
    });
  });

  it("min-gap: an earlier reel does not block a later image", () => {
    const reel: PublicationItem = {
      ...item("021", "2026-11-13T09:00:00-03:00"),
      media: { kind: "reel", video: { url: "https://media.example/v.mp4" }, cover: { url: "https://media.example/c.jpg" } },
    };
    const items = [reel, item("022", "2026-11-13T15:00:00-03:00")];
    expect(selectWorkItem(items, new Date("2026-11-13T18:30:00.000Z"), tz, minGap, reelFinished)).toMatchObject({
      kind: "item",
      item: { occurrence: "022" },
    });
  });

  it("min-gap: nothing today or everything finished is none", () => {
    const items = [item("021", "2026-11-13T09:00:00-03:00")];
    expect(selectWorkItem(items, new Date("2026-11-14T18:30:00.000Z"), tz, minGap, notFinished)).toEqual({ kind: "none" });
    expect(selectWorkItem(items, new Date("2026-11-13T18:30:00.000Z"), tz, minGap, () => true)).toEqual({ kind: "none" });
  });

  it("single: two due items stay a conflict", () => {
    const items = [item("a", "2026-11-13T09:00:00-03:00"), item("b", "2026-11-13T10:00:00-03:00")];
    expect(selectWorkItem(items, new Date("2026-11-13T18:30:00.000Z"), tz, { kind: "single" }, notFinished)).toEqual({
      kind: "conflict",
      occurrences: ["a", "b"],
    });
  });
});
