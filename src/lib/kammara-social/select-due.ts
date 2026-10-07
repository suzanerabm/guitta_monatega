import type { PublicationItem } from "./types";

const SAO_PAULO_OFFSET_MS = 3 * 60 * 60 * 1000;

export function saoPauloDate(date: Date): string {
  return new Date(date.getTime() - SAO_PAULO_OFFSET_MS).toISOString().slice(0, 10);
}

export function selectDuePublication(items: PublicationItem[], now: Date): PublicationItem | null {
  const today = saoPauloDate(now);
  return items.find((item) => item.scheduledAt.slice(0, 10) === today) ?? null;
}
