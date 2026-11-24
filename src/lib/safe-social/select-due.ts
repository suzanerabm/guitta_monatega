import type { PublicationItem } from "./types";

export const STUDIO_PUBLICATION_TIME_ZONE = "America/Sao_Paulo";

export function studioCalendarDate(value: Date, timeZone = STUDIO_PUBLICATION_TIME_ZONE): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((candidate) => candidate.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function isPublicationScheduledForToday(
  item: PublicationItem,
  now: Date,
  timeZone = STUDIO_PUBLICATION_TIME_ZONE,
): boolean {
  const scheduled = new Date(item.scheduledAt);
  if (!Number.isFinite(scheduled.getTime()) || scheduled > now) return false;
  return studioCalendarDate(scheduled, timeZone) === studioCalendarDate(now, timeZone);
}

// Intentionally does not implement catch-up. Past and future calendar dates are invisible.
export function selectDuePublications(
  items: PublicationItem[],
  now: Date,
  timeZone = STUDIO_PUBLICATION_TIME_ZONE,
): PublicationItem[] {
  return items.filter((item) => isPublicationScheduledForToday(item, now, timeZone));
}
