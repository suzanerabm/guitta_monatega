import { randomUUID } from "node:crypto";
import queue from "./publication-queue.json";
import { publishers } from "./meta";
import { selectDuePublications } from "./select-due";
import { acquire, save } from "./state";
import type { PlatformState, PublicationItem } from "./types";

const items = queue.items as PublicationItem[];

export async function runBichittosPublisher(now = new Date(), dryRun = false) {
  if (queue.mode !== "active" && !dryRun) return { status: "inactive", mode: queue.mode };
  const due = selectDuePublications(items, now);
  if (!due.length) return { status: "nothing-due", date: now.toISOString(), exhausted: now > new Date(queue.end ?? 0) };
  const item = due[0];
  if (dryRun) return { status: "dry-run", occurrence: item.occurrence, postId: item.postId, media: item.media.kind, scheduledAt: item.scheduledAt };

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
  if (!selected || !stored) return { status: "nothing-due", date: now.toISOString(), exhausted: now > new Date(queue.end ?? 0) };
  const publication = selected;

  const execute = async (platform: "instagram" | "facebook", publish: (publication: PublicationItem) => Promise<string>) => {
    const platformState: PlatformState = stored!.state[platform];
    if (platformState.status === "published") return;
    platformState.status = "publishing";
    platformState.error = null;
    stored = await save(stored!);
    try {
      platformState.externalId = await publish(publication);
      platformState.status = "published";
    } catch (error) {
      platformState.status = "needs_review";
      platformState.error = error instanceof Error ? error.message : String(error);
      stored = await save(stored!);
      throw error;
    }
    stored = await save(stored!);
  };

  await execute("instagram", publishers.instagram);
  await execute("facebook", publishers.facebook);
  return { status: "published", occurrence: publication.occurrence, postId: publication.postId, instagramId: stored.state.instagram.externalId, facebookId: stored.state.facebook.externalId };
}
