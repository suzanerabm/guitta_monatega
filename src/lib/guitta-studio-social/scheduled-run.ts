import { randomUUID } from "node:crypto";
import queue from "./publication-queue.json";
import { advanceStudioPublication } from "./safe-publisher";
import { selectDuePublications } from "./select-due";
import {
  acquire,
  consumeStudioScheduleAuthorization,
  pauseStudioSchedule,
  readPublicationState,
  readStudioScheduleControl,
  save,
} from "./state";
import type { PublicationItem } from "./types";

const items = queue.items as PublicationItem[];

async function pause(reason: string, now: Date): Promise<void> {
  try {
    await pauseStudioSchedule(reason, now);
  } catch (error) {
    console.error(JSON.stringify({
      event: "studio_schedule_pause_failed",
      reason,
      error: error instanceof Error ? error.message : String(error),
    }));
  }
}

export async function runGuittaStudioScheduledPublisher(now = new Date()) {
  if (queue.mode !== "active") return { status: "inactive", mode: queue.mode, calls: 0 };

  const due = selectDuePublications(items, now, queue.timezone);
  if (due.length === 0) return { status: "no-publication-today", calls: 0 };
  if (due.length > 1) {
    const reason = `Schedule conflict for ${due.map((item) => item.occurrence).join(", ")}; zero Meta calls made.`;
    await pause(reason, now);
    return { status: "schedule-conflict", occurrences: due.map((item) => item.occurrence), calls: 0 };
  }

  const item = due[0];
  if (item.media.kind === "reel") {
    return { status: "reel-manual-only", occurrence: item.occurrence, calls: 0 };
  }

  const control = await readStudioScheduleControl();
  if (!control.enabled) {
    return { status: "schedule-paused", reason: control.pauseReason, pausedAt: control.pausedAt, calls: 0 };
  }
  if (control.allowedPlatforms.length === 0) {
    const reason = "Studio schedule has no explicitly authorized platform; zero Meta calls made.";
    await pause(reason, now);
    return { status: "needs-review", occurrence: item.occurrence, reason, calls: 0 };
  }

  const existing = await readPublicationState(item.occurrence);
  if (existing && control.allowedPlatforms.every((platform) => existing[platform].status === "published")) {
    return { status: "published", occurrence: item.occurrence, calls: 0 };
  }

  let acquired;
  try {
    acquired = await acquire(item.occurrence, now, randomUUID());
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    await pause(`Studio occurrence ${item.occurrence} requires human review: ${reason}`, now);
    return { status: "needs-review", occurrence: item.occurrence, reason, calls: 0 };
  }
  if (acquired.status === "published") return { status: "published", occurrence: item.occurrence, calls: 0 };
  if (acquired.status === "locked") return { status: "locked", occurrence: item.occurrence, calls: 0 };

  const outcome = await advanceStudioPublication({
    occurrence: item.occurrence,
    item,
    stored: acquired.stored,
    allowedPlatforms: control.allowedPlatforms,
    now,
    save,
    consumeAuthorization: (authorization) => consumeStudioScheduleAuthorization(authorization, item, new Date()),
    pauseBrand: (reason) => pauseStudioSchedule(reason),
  });

  if (outcome.result.status === "needs-review" || outcome.result.pausedReason) {
    await pause(
      outcome.result.pausedReason
        ?? `Studio occurrence ${item.occurrence} entered needs-review; automatic publishing stopped.`,
      new Date(),
    );
  }

  return {
    occurrence: item.occurrence,
    postId: item.postId,
    ...outcome.result,
  };
}
