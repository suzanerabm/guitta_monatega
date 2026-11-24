import type { SameDayPolicy } from "./brands";
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

export type WorkSelection =
  | { kind: "none" }
  | { kind: "conflict"; occurrences: string[] }
  | { kind: "item"; item: PublicationItem };

// Pure selection. `isFinished` is only consulted for the min-gap policy; `single` keeps the
// original behavior (more than one due item is a conflict, one due item is the work).
export function selectWorkItem(
  items: PublicationItem[],
  now: Date,
  timeZone: string,
  policy: SameDayPolicy,
  isFinished: (item: PublicationItem) => boolean,
): WorkSelection {
  const due = selectDuePublications(items, now, timeZone);

  if (policy.kind === "single") {
    if (due.length === 0) return { kind: "none" };
    if (due.length > 1) return { kind: "conflict", occurrences: due.map((item) => item.occurrence) };
    return { kind: "item", item: due[0] };
  }

  const today = studioCalendarDate(now, timeZone);
  const todays = items
    .filter((item) => {
      const scheduled = new Date(item.scheduledAt);
      return Number.isFinite(scheduled.getTime()) && studioCalendarDate(scheduled, timeZone) === today;
    })
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  for (let index = 1; index < todays.length; index += 1) {
    const gap = new Date(todays[index].scheduledAt).getTime() - new Date(todays[index - 1].scheduledAt).getTime();
    if (gap < policy.minGapMs) {
      return { kind: "conflict", occurrences: todays.map((item) => item.occurrence) };
    }
  }

  const dueSet = new Set(due);
  const next = todays.find((item) => dueSet.has(item) && !isFinished(item));
  return next ? { kind: "item", item: next } : { kind: "none" };
}
