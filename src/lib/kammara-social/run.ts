import { randomUUID } from "node:crypto";
import queue from "./publication-queue.json";
import { publishers } from "./meta";
import { selectDuePublication } from "./select-due";
import { acquire, save } from "./state";
import type { PlatformState, PublicationItem } from "./types";

const items = queue.items as PublicationItem[];

export async function runKammaraPublisher(now = new Date(), dryRun = false) {
  const item = selectDuePublication(items, now);
  if (!item) return { status: "nothing-due", date: now.toISOString() };
  if (dryRun) return { status: "dry-run", occurrence: item.occurrence, discovery: item.discovery, media: item.media.kind };

  let stored = await acquire(item.occurrence, now, randomUUID());
  if (!stored) return { status: "already-published-or-locked", occurrence: item.occurrence };

  const execute = async (platform: "instagram" | "facebook", publish: (item: PublicationItem) => Promise<string>) => {
    const platformState: PlatformState = stored!.state[platform];
    if (platformState.status === "published") return;
    platformState.status = "publishing";
    platformState.error = null;
    stored = await save(stored!);
    try {
      platformState.externalId = await publish(item);
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
  return { status: "published", occurrence: item.occurrence, discovery: item.discovery, instagramId: stored.state.instagram.externalId, facebookId: stored.state.facebook.externalId };
}
