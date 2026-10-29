import { randomUUID } from "node:crypto";
import { publishPlatforms } from "@/lib/social-meta/execute";
import queue from "./publication-queue.json";
import { publishers } from "./meta";
import { selectDuePublication } from "./select-due";
import { acquire, pauseBrand, readBrandControl, save } from "./state";
import type { PublicationItem } from "./types";

const items = queue.items as PublicationItem[];

export async function runKammaraPublisher(now = new Date(), dryRun = false) {
  const item = selectDuePublication(items, now);
  if (!item) return { status: "nothing-due", date: now.toISOString() };
  if (dryRun) return { status: "dry-run", occurrence: item.occurrence, discovery: item.discovery, media: item.media.kind };

  const control = await readBrandControl();
  if (!control.publishingEnabled) return { status: "brand-paused", reason: control.pauseReason, pausedAt: control.pausedAt };

  let stored = await acquire(item.occurrence, now, randomUUID());
  if (!stored) return { status: "already-published-or-locked", occurrence: item.occurrence };

  const result = await publishPlatforms({
    brand: "kammara",
    occurrence: item.occurrence,
    item,
    stored,
    save,
    publishers,
    pauseBrand: (reason) => pauseBrand(reason),
  });
  stored = result.stored;
  if (result.pausedReason) return { status: "brand-paused-after-publish", occurrence: item.occurrence, reason: result.pausedReason };
  return { status: "published", occurrence: item.occurrence, discovery: item.discovery, instagramId: stored.state.instagram.externalId, facebookId: stored.state.facebook.externalId };
}
