import bichittosQueue from "@/lib/bichittos-social/publication-queue.json";
import studioQueue from "@/lib/guitta-studio-social/publication-queue.json";
import type { PublishingBrand } from "@/lib/social-publishing-alerts";
import type { PublicationItem } from "./types";

// Each brand that uses the safe Meta publisher is described here. The publisher code is shared;
// only these values differ between brands.

export type SameDayPolicy = { kind: "single" } | { kind: "min-gap"; minGapMs: number };

// Texts that the routes, alerts and internal error messages show for a brand. They are kept here,
// verbatim, so moving a brand to the shared publisher never changes what people read.
export type SafeBrandCopy = {
  // Short name inside error/pause messages, e.g. "Studio daily Meta call limit 32 reached."
  label: string;
  // Prefix of the structured log event emitted when a schedule pause fails.
  logEventPrefix: string;
  // Name used in console logs of the routes, e.g. "Guitta Studio scheduled publisher result".
  logName: string;
  cronDisabledMessage: string;
  cronReviewAlertSummary: string;
  cronFailureAlertSummary: string;
  manualPausedMessage: string;
  manualFailureAlertSummary: string;
};

export type SafeBrand = {
  id: "guitta-studio" | "bichittos"; // used as the MetaClient `brand`
  alertBrand: PublishingBrand;
  envPrefix: "GUITTA_STUDIO" | "BICHITTOS";
  statePrefix: string; // ends with "/"
  queue: { mode: string; timezone: string; items: PublicationItem[] };
  maxMetaCallsPerDay: number;
  sameDay: SameDayPolicy;
  copy: SafeBrandCopy;
};

export const GUITTA_STUDIO: SafeBrand = {
  id: "guitta-studio",
  alertBrand: "Guitta Monatega Studio",
  envPrefix: "GUITTA_STUDIO",
  statePrefix: "publications/guitta-monatega-studio/",
  queue: {
    mode: studioQueue.mode,
    timezone: studioQueue.timezone,
    items: studioQueue.items as PublicationItem[],
  },
  maxMetaCallsPerDay: 32,
  sameDay: { kind: "single" },
  copy: {
    label: "Studio",
    logEventPrefix: "studio",
    logName: "Guitta Studio",
    cronDisabledMessage: "Guitta Studio scheduled publishing is disabled.",
    cronReviewAlertSummary: "O cron seguro do Studio foi pausado para revisão.",
    cronFailureAlertSummary: "O cron seguro do Studio encontrou uma falha e foi pausado.",
    manualPausedMessage: "Guitta Studio publishing is paused pending a Meta API safety review.",
    manualFailureAlertSummary: "O publicador encontrou uma falha.",
  },
};

// Bichittos queue items already have the PublicationItem shape; extra fields (seasonality,
// postado, upload…) are ignored by the publisher.
export const BICHITTOS: SafeBrand = {
  id: "bichittos",
  alertBrand: "Bichittos",
  envPrefix: "BICHITTOS",
  statePrefix: "publications/bichittos/",
  queue: {
    mode: bichittosQueue.mode,
    timezone: bichittosQueue.timezone,
    items: bichittosQueue.items as unknown as PublicationItem[],
  },
  maxMetaCallsPerDay: 32,
  sameDay: { kind: "min-gap", minGapMs: 4 * 60 * 60 * 1000 },
  copy: {
    label: "Bichittos",
    logEventPrefix: "bichittos",
    logName: "Bichittos",
    cronDisabledMessage: "Bichittos scheduled publishing is disabled.",
    cronReviewAlertSummary: "O cron seguro dos Bichittos foi pausado para revisão.",
    cronFailureAlertSummary: "O cron seguro dos Bichittos encontrou uma falha e foi pausado.",
    manualPausedMessage: "Bichittos publishing is paused pending a Meta API safety review.",
    manualFailureAlertSummary: "O publicador encontrou uma falha.",
  },
};
