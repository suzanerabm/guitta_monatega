import { randomUUID } from "node:crypto";
import type { SafeBrand } from "./brands";
import { advancePublication } from "./safe-publisher";
import { selectDuePublications } from "./select-due";
import { storeFor, type BrandStore } from "./state";

const MAX_AUTHORIZATION_HORIZON_MS = 24 * 60 * 60 * 1000;

export async function runManualPublisher(
  brand: SafeBrand,
  now = new Date(),
  dryRun = false,
  store: BrandStore = storeFor(brand),
) {
  const { queue } = brand;
  if (queue.mode !== "active" && !dryRun) return { status: "inactive", mode: queue.mode };
  const control = await store.readBrandControl();
  if (!control.publishingEnabled) return { status: "brand-paused", reason: control.pauseReason, pausedAt: control.pausedAt };
  if (!control.allowedOccurrence || control.allowedPlatforms.length !== 1 || !control.allowedOperation || !control.authorizationExpiresAt) {
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

  const due = selectDuePublications(queue.items, now, queue.timezone);
  if (due.length > 1) {
    return {
      status: "schedule-conflict",
      occurrences: due.map((candidate) => candidate.occurrence),
      calls: 0,
    };
  }
  const item = due.find((candidate) => candidate.occurrence === control.allowedOccurrence);
  if (!item) return { status: "authorized-occurrence-not-scheduled-today", occurrence: control.allowedOccurrence, calls: 0 };
  if (item.media.kind === "reel") {
    return { status: "reel-manual-only", occurrence: item.occurrence, calls: 0 };
  }
  if (dryRun) {
    return {
      status: "dry-run",
      occurrence: item.occurrence,
      postId: item.postId,
      media: item.media.kind,
      scheduledAt: item.scheduledAt,
      allowedPlatforms: control.allowedPlatforms,
      allowedOperation: control.allowedOperation,
      allowedCarouselIndex: control.allowedCarouselIndex,
      authorizationExpiresAt: control.authorizationExpiresAt,
      calls: 0,
    };
  }

  const acquired = await store.acquire(item.occurrence, now, randomUUID());
  if (acquired.status === "published") return { status: "published", occurrence: item.occurrence, calls: 0 };
  if (acquired.status === "locked") return { status: "locked", occurrence: item.occurrence, calls: 0 };
  const outcome = await advancePublication(brand, {
    occurrence: item.occurrence,
    item,
    stored: acquired.stored,
    allowedPlatforms: control.allowedPlatforms,
    now,
    save: (stored) => store.save(stored),
    consumeAuthorization: (authorization) => store.consumeBrandAuthorization(authorization),
    pauseBrand: (reason) => store.pauseBrand(reason),
  });
  return {
    occurrence: item.occurrence,
    postId: item.postId,
    ...outcome.result,
  };
}
