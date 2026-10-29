import { randomUUID } from "node:crypto";
import { publishPlatforms } from "@/lib/social-meta/execute";
import queue from "./publication-queue.json";
import { publishers } from "./meta";
import { selectDuePublications } from "./select-due";
import { acquire, pauseBrand, readBrandControl, save } from "./state";
import type { PublicationItem } from "./types";

const items = queue.items as PublicationItem[];

export async function runGuittaStudioPublisher(now = new Date(), dryRun = false) {
  if (queue.mode !== "active" && !dryRun) return { status: "inactive", mode: queue.mode };
  const due = selectDuePublications(items, now);
  if (!due.length) return { status: queue.mode === "draft" ? "draft-empty" : "nothing-due", date: now.toISOString(), exhausted: false };
  const item = due[0];
  if (dryRun) return { status: "dry-run", occurrence: item.occurrence, postId: item.postId, media: item.media.kind, scheduledAt: item.scheduledAt };

  const control = await readBrandControl();
  if (!control.publishingEnabled) return { status: "brand-paused", reason: control.pauseReason, pausedAt: control.pausedAt };

  let selected: PublicationItem | null = null;
  let stored = null;
  for (const candidate of due) {
    const result = await acquire(candidate.occurrence, now, randomUUID());
    if (result.status === "published") continue;
    if (result.status === "locked") return { status: "locked", occurrence: candidate.occurrence };
    selected = candidate;
    stored = result.stored;
    break;
  }
  if (!selected || !stored) return { status: "nothing-due", date: now.toISOString(), exhausted: false };
  const publication = selected;
  const result = await publishPlatforms({
    brand: "guitta-studio",
    occurrence: publication.occurrence,
    item: publication,
    stored,
    save,
    publishers,
    pauseBrand: (reason) => pauseBrand(reason),
  });
  stored = result.stored;
  if (result.pausedReason) return { status: "brand-paused-after-publish", occurrence: publication.occurrence, reason: result.pausedReason };
  return { status: "published", occurrence: publication.occurrence, postId: publication.postId, instagramId: stored.state.instagram.externalId, facebookId: stored.state.facebook.externalId };
}
