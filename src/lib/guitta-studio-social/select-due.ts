import type { PublicationItem } from "./types";

export function selectDuePublications(items: PublicationItem[], now: Date): PublicationItem[] {
  const nowMs = now.getTime();
  return items.filter((item) => new Date(item.scheduledAt).getTime() <= nowMs);
}
