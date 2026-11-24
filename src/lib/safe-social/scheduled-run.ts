import { randomUUID } from "node:crypto";
import type { SafeBrand } from "./brands";
import { advancePublication } from "./safe-publisher";
import { selectDuePublications, selectWorkItem } from "./select-due";
import type { PublicationItem } from "./types";
import { storeFor, type BrandStore } from "./state";

async function pause(brand: SafeBrand, store: BrandStore, reason: string, now: Date): Promise<void> {
  try {
    await store.pauseSchedule(reason, now);
  } catch (error) {
    console.error(JSON.stringify({
      event: `${brand.copy.logEventPrefix}_schedule_pause_failed`,
      reason,
      error: error instanceof Error ? error.message : String(error),
    }));
  }
}

export async function runScheduledPublisher(brand: SafeBrand, now = new Date(), store: BrandStore = storeFor(brand)) {
  const { queue } = brand;
  if (queue.mode !== "active") return { status: "inactive", mode: queue.mode, calls: 0 };

  // The control is read before selection only when the brand allows several posts per day: deciding
  // whether the first post is finished depends on the authorized platforms. `single` brands keep the
  // original order (no control read on an empty day, conflict before any S3 read).
  let control: Awaited<ReturnType<BrandStore["readScheduleControl"]>> | null = null;
  const finished = new Set<string>();
  if (brand.sameDay.kind === "min-gap") {
    const due = selectDuePublications(queue.items, now, queue.timezone);
    if (due.length > 0) {
      control = await store.readScheduleControl();
      for (const candidate of due) {
        if (candidate.media.kind === "reel") {
          finished.add(candidate.occurrence);
        } else if (control.enabled && control.allowedPlatforms.length > 0) {
          const state = await store.readPublicationState(candidate.occurrence);
          if (state && control.allowedPlatforms.every((platform) => state[platform].status === "published")) {
            finished.add(candidate.occurrence);
          }
        }
      }
    }
  }

  const selection = selectWorkItem(
    queue.items,
    now,
    queue.timezone,
    brand.sameDay,
    (candidate: PublicationItem) => finished.has(candidate.occurrence),
  );
  if (selection.kind === "none") return { status: "no-publication-today", calls: 0 };
  if (selection.kind === "conflict") {
    const reason = `Schedule conflict for ${selection.occurrences.join(", ")}; zero Meta calls made.`;
    await pause(brand, store, reason, now);
    return { status: "schedule-conflict", occurrences: selection.occurrences, calls: 0 };
  }

  const item = selection.item;
  if (item.media.kind === "reel") {
    return { status: "reel-manual-only", occurrence: item.occurrence, calls: 0 };
  }

  control ??= await store.readScheduleControl();
  if (!control.enabled) {
    return { status: "schedule-paused", reason: control.pauseReason, pausedAt: control.pausedAt, calls: 0 };
  }
  if (control.allowedPlatforms.length === 0) {
    const reason = `${brand.copy.label} schedule has no explicitly authorized platform; zero Meta calls made.`;
    await pause(brand, store, reason, now);
    return { status: "needs-review", occurrence: item.occurrence, reason, calls: 0 };
  }

  const existing = await store.readPublicationState(item.occurrence);
  if (existing && control.allowedPlatforms.every((platform) => existing[platform].status === "published")) {
    return { status: "published", occurrence: item.occurrence, calls: 0 };
  }

  let acquired;
  try {
    acquired = await store.acquire(item.occurrence, now, randomUUID());
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    await pause(brand, store, `${brand.copy.label} occurrence ${item.occurrence} requires human review: ${reason}`, now);
    return { status: "needs-review", occurrence: item.occurrence, reason, calls: 0 };
  }
  if (acquired.status === "published") return { status: "published", occurrence: item.occurrence, calls: 0 };
  if (acquired.status === "locked") return { status: "locked", occurrence: item.occurrence, calls: 0 };

  const outcome = await advancePublication(brand, {
    occurrence: item.occurrence,
    item,
    stored: acquired.stored,
    allowedPlatforms: control.allowedPlatforms,
    now,
    save: (stored) => store.save(stored),
    consumeAuthorization: (authorization) => store.consumeScheduleAuthorization(authorization, item, new Date()),
    pauseBrand: (reason) => store.pauseSchedule(reason),
  });

  if (outcome.result.status === "needs-review" || outcome.result.pausedReason) {
    await pause(
      brand,
      store,
      outcome.result.pausedReason
        ?? `${brand.copy.label} occurrence ${item.occurrence} entered needs-review; automatic publishing stopped.`,
      new Date(),
    );
  }

  return {
    occurrence: item.occurrence,
    postId: item.postId,
    ...outcome.result,
  };
}
