import { randomUUID } from "node:crypto";
import queue from "./publication-queue.json";
import { advanceStudioPublication } from "./safe-publisher";
import { selectDuePublications } from "./select-due";
import { acquire, pauseBrand, readBrandControl, save } from "./state";
import type { PublicationItem } from "./types";

const items = queue.items as PublicationItem[];
const MAX_AUTHORIZATION_HORIZON_MS = 24 * 60 * 60 * 1000;

export async function runGuittaStudioPublisher(now = new Date(), dryRun = false) {
  if (queue.mode !== "active" && !dryRun) return { status: "inactive", mode: queue.mode };
  const control = await readBrandControl();
  if (!control.publishingEnabled) return { status: "brand-paused", reason: control.pauseReason, pausedAt: control.pausedAt };
  if (!control.allowedOccurrence || control.allowedPlatforms.length !== 1 || !control.authorizationExpiresAt) {
    return { status: "manual-authorization-required", calls: 0 };
  }
  const authorizationExpiresAt = new Date(control.authorizationExpiresAt);
  if (
    !Number.isFinite(authorizationExpiresAt.getTime())
    || authorizationExpiresAt <= now
    || authorizationExpiresAt.getTime() - now.getTime() > MAX_AUTHORIZATION_HORIZON_MS
  ) {
    return { status: "manual-authorization-expired", calls: 0, authorizationExpiresAt: control.authorizationExpiresAt };
  }

  const due = selectDuePublications(items, now);
  const item = due.find((candidate) => candidate.occurrence === control.allowedOccurrence);
  if (!item) return { status: "authorized-occurrence-not-due", occurrence: control.allowedOccurrence, calls: 0 };
  if (dryRun) {
    return {
      status: "dry-run",
      occurrence: item.occurrence,
      postId: item.postId,
      media: item.media.kind,
      scheduledAt: item.scheduledAt,
      allowedPlatforms: control.allowedPlatforms,
      authorizationExpiresAt: control.authorizationExpiresAt,
      calls: 0,
    };
  }

  const acquired = await acquire(item.occurrence, now, randomUUID());
  if (acquired.status === "published") return { status: "published", occurrence: item.occurrence, calls: 0 };
  if (acquired.status === "locked") return { status: "locked", occurrence: item.occurrence, calls: 0 };
  const outcome = await advanceStudioPublication({
    occurrence: item.occurrence,
    item,
    stored: acquired.stored,
    allowedPlatforms: control.allowedPlatforms,
    now,
    save,
    pauseBrand: (reason) => pauseBrand(reason),
  });
  return {
    occurrence: item.occurrence,
    postId: item.postId,
    ...outcome.result,
  };
}
