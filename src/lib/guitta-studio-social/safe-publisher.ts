import { randomUUID } from "node:crypto";
import { MetaPublishingError } from "@/lib/social-meta/client";
import { performStudioMetaOperation, type StudioMetaResult } from "./meta";
import { isPublicationScheduledForToday } from "./select-due";
import type { StoredState } from "./state";
import type {
  CarouselChildState,
  MetaCallAuthorization,
  MetaOperation,
  Platform,
  PlatformState,
  PlatformStatus,
  PublicationItem,
} from "./types";

const FIRST_STATUS_DELAY_MS = 60_000;
const CONFIRM_DELAY_MS = 5 * 60_000;
const STATUS_RECHECK_DELAYS_MS = [5 * 60_000, 15 * 60_000] as const;
const MAX_STATUS_CHECKS = 3;
const MIN_CAROUSEL_IMAGES = 2;
const MAX_CAROUSEL_IMAGES = 10;

type PerformOperation = typeof performStudioMetaOperation;
type PlannedOperation = { operation: MetaOperation; carouselIndex: number | null };

export type SafeStepResult = {
  status:
    | "waiting"
    | "state-advanced"
    | "meta-call-completed"
    | "published"
    | "needs-review"
    | "platform-not-authorized"
    | "outside-publication-day"
    | "manual-only";
  platform: Platform | null;
  operation: MetaOperation | null;
  carouselIndex?: number | null;
  calls: 0 | 1;
  nextActionAt?: string | null;
  pausedReason?: string | null;
};

type AdvanceOptions = {
  occurrence: string;
  item: PublicationItem;
  stored: StoredState;
  allowedPlatforms: Platform[];
  now: Date;
  save: (stored: StoredState) => Promise<StoredState>;
  consumeAuthorization: (authorization: MetaCallAuthorization) => Promise<void>;
  pauseBrand: (reason: string) => Promise<void>;
  performOperation?: PerformOperation;
};

function isoAfter(now: Date, milliseconds: number): string {
  return new Date(now.getTime() + milliseconds).toISOString();
}

function isFuture(value: string | null, now: Date): boolean {
  return value !== null && new Date(value).getTime() > now.getTime();
}

function selectPlatform(stored: StoredState, allowed: Platform[]): Platform | null {
  for (const platform of allowed) {
    if (stored.state[platform].status !== "published") return platform;
  }
  return null;
}

function imageOperationFor(platform: Platform, state: PlatformState): PlannedOperation | null {
  if (platform === "instagram") {
    if (state.status === "pending") return { operation: "create_instagram_container", carouselIndex: null };
    if (state.status === "waiting_for_media") return { operation: "check_instagram_container", carouselIndex: null };
    if (state.status === "media_ready") return { operation: "publish_instagram_media", carouselIndex: null };
    if (state.status === "publish_requested") return { operation: "confirm_instagram_media", carouselIndex: null };
    return null;
  }
  if (state.status === "pending") return { operation: "publish_facebook_image", carouselIndex: null };
  if (state.status === "publish_requested") return { operation: "confirm_facebook_media", carouselIndex: null };
  return null;
}

function carouselOperationFor(platform: Platform, state: PlatformState): PlannedOperation | null {
  if (state.status === "building_carousel") {
    const children = state.carousel?.children ?? [];
    const index = children.findIndex((child) => child.status !== "media_ready");
    if (index >= 0) {
      const child = children[index];
      if (platform === "instagram" && child.status === "waiting_for_media") {
        return { operation: "check_instagram_carousel_child", carouselIndex: index };
      }
      if (child.status === "pending") {
        return {
          operation: platform === "instagram" ? "create_instagram_carousel_child" : "create_facebook_carousel_child",
          carouselIndex: index,
        };
      }
      return null;
    }
    return {
      operation: platform === "instagram" ? "create_instagram_carousel_container" : "publish_facebook_carousel",
      carouselIndex: null,
    };
  }
  if (platform === "instagram") {
    if (state.status === "waiting_for_media") return { operation: "check_instagram_container", carouselIndex: null };
    if (state.status === "media_ready") return { operation: "publish_instagram_media", carouselIndex: null };
    if (state.status === "publish_requested") return { operation: "confirm_instagram_media", carouselIndex: null };
    return null;
  }
  if (state.status === "publish_requested") return { operation: "confirm_facebook_media", carouselIndex: null };
  return null;
}

function markNeedsReview(state: PlatformState, message: string): void {
  state.status = "needs_review";
  state.inFlight = null;
  state.nextActionAt = null;
  state.error = message;
}

function completedStatus(status: PlatformStatus): SafeStepResult["status"] {
  if (status === "published") return "published";
  if (status === "needs_review") return "needs-review";
  return "meta-call-completed";
}

function requireResultId(result: StudioMetaResult, operation: MetaOperation): string {
  if (!result.id) throw new Error(`${operation} returned no ID; result is ambiguous and requires human review.`);
  return result.id;
}

function carouselChild(state: PlatformState, index: number | null, operation: MetaOperation): CarouselChildState {
  if (index === null) throw new Error(`${operation} is missing its carousel index; result requires human review.`);
  const child = state.carousel?.children[index];
  if (!child) throw new Error(`${operation} references invalid carousel index ${index}; result requires human review.`);
  return child;
}

function applyContainerStatus(state: PlatformState, result: StudioMetaResult, now: Date): void {
  state.statusChecks += 1;
  if (result.statusCode === "FINISHED") {
    state.status = "media_ready";
    state.nextActionAt = null;
    return;
  }
  if (result.statusCode === "IN_PROGRESS" && state.statusChecks < MAX_STATUS_CHECKS) {
    const delay = STATUS_RECHECK_DELAYS_MS[Math.min(state.statusChecks - 1, STATUS_RECHECK_DELAYS_MS.length - 1)];
    state.status = "waiting_for_media";
    state.nextActionAt = isoAfter(now, delay);
    return;
  }
  const detail = result.status ? ` (${result.status})` : "";
  markNeedsReview(state, `Instagram container status ${result.statusCode ?? "UNKNOWN"}${detail}; no retry.`);
}

function applySuccess(
  state: PlatformState,
  planned: PlannedOperation,
  result: StudioMetaResult,
  now: Date,
): void {
  state.inFlight = null;
  state.error = null;
  switch (planned.operation) {
    case "create_instagram_container":
      state.containerId = requireResultId(result, planned.operation);
      state.status = "container_created";
      state.nextActionAt = isoAfter(now, FIRST_STATUS_DELAY_MS);
      return;
    case "create_instagram_carousel_child": {
      const child = carouselChild(state, planned.carouselIndex, planned.operation);
      child.containerId = requireResultId(result, planned.operation);
      child.status = "waiting_for_media";
      child.nextActionAt = isoAfter(now, FIRST_STATUS_DELAY_MS);
      child.error = null;
      state.nextActionAt = child.nextActionAt;
      return;
    }
    case "check_instagram_carousel_child": {
      const child = carouselChild(state, planned.carouselIndex, planned.operation);
      child.statusChecks += 1;
      child.nextActionAt = null;
      state.nextActionAt = null;
      if (result.statusCode === "FINISHED") {
        child.status = "media_ready";
        child.error = null;
        return;
      }
      const detail = result.status ? ` (${result.status})` : "";
      child.status = "needs_review";
      child.error = `Instagram carousel child status ${result.statusCode ?? "UNKNOWN"}${detail}; no retry.`;
      markNeedsReview(state, child.error);
      return;
    }
    case "create_facebook_carousel_child": {
      const child = carouselChild(state, planned.carouselIndex, planned.operation);
      child.containerId = requireResultId(result, planned.operation);
      child.status = "media_ready";
      child.nextActionAt = null;
      child.error = null;
      state.nextActionAt = null;
      return;
    }
    case "create_instagram_carousel_container":
      state.containerId = requireResultId(result, planned.operation);
      state.status = "container_created";
      state.nextActionAt = isoAfter(now, FIRST_STATUS_DELAY_MS);
      return;
    case "check_instagram_container":
      applyContainerStatus(state, result, now);
      return;
    case "publish_instagram_media":
    case "publish_facebook_image":
    case "publish_facebook_carousel":
      state.externalId = requireResultId(result, planned.operation);
      state.status = "publish_requested";
      state.nextActionAt = isoAfter(now, CONFIRM_DELAY_MS);
      return;
    case "confirm_instagram_media":
    case "confirm_facebook_media":
      requireResultId(result, planned.operation);
      state.status = "published";
      state.nextActionAt = null;
      return;
  }
}

function carouselState(count: number): PlatformState["carousel"] {
  return {
    children: Array.from({ length: count }, () => ({
      status: "pending" as const,
      containerId: null,
      nextActionAt: null,
      statusChecks: 0,
      error: null,
    })),
  };
}

function validateCarousel(item: PublicationItem): string | null {
  if (item.media.kind !== "carousel") return null;
  if (item.media.images.length < MIN_CAROUSEL_IMAGES || item.media.images.length > MAX_CAROUSEL_IMAGES) {
    return `Carousel must contain ${MIN_CAROUSEL_IMAGES}-${MAX_CAROUSEL_IMAGES} images; zero Meta calls made.`;
  }
  for (const image of item.media.images) {
    try {
      const url = new URL(image.url);
      if (url.protocol !== "https:") return "Carousel image URLs must use HTTPS; zero Meta calls made.";
    } catch {
      return "Carousel contains an invalid image URL; zero Meta calls made.";
    }
  }
  return null;
}

function metaCallBudget(item: PublicationItem): number {
  if (item.media.kind === "image") return 8;
  if (item.media.kind === "carousel") return item.media.images.length * 3 + 8;
  return 0;
}

async function pauseBestEffort(pauseBrand: (reason: string) => Promise<void>, reason: string): Promise<void> {
  try {
    await pauseBrand(reason);
  } catch (error) {
    console.error(JSON.stringify({
      event: "brand_pause_failed",
      brand: "guitta-studio",
      reason,
      error: error instanceof Error ? error.message : String(error),
    }));
  }
}

export async function advanceStudioPublication(options: AdvanceOptions): Promise<{ stored: StoredState; result: SafeStepResult }> {
  let stored = options.stored;
  if (!isPublicationScheduledForToday(options.item, options.now)) {
    return {
      stored,
      result: { status: "outside-publication-day", platform: null, operation: null, calls: 0 },
    };
  }
  if (options.item.media.kind === "reel") {
    return {
      stored,
      result: { status: "manual-only", platform: null, operation: null, calls: 0 },
    };
  }

  const platform = selectPlatform(stored, options.allowedPlatforms);
  if (!platform) {
    const allAuthorizedPublished = options.allowedPlatforms.length > 0
      && options.allowedPlatforms.every((candidate) => stored.state[candidate].status === "published");
    return {
      stored,
      result: {
        status: allAuthorizedPublished ? "published" : "platform-not-authorized",
        platform: null,
        operation: null,
        calls: 0,
      },
    };
  }

  const state = stored.state[platform];
  const carouselError = validateCarousel(options.item);
  if (carouselError) {
    markNeedsReview(state, carouselError);
    stored = await options.save(stored);
    return { stored, result: { status: "needs-review", platform, operation: null, calls: 0 } };
  }
  if (state.inFlight) {
    markNeedsReview(state, `Previous ${state.inFlight.operation} result is unknown; automatic repetition is forbidden.`);
    stored = await options.save(stored);
    return { stored, result: { status: "needs-review", platform, operation: null, calls: 0 } };
  }
  if (state.status === "needs_review" || state.status === "brand_paused") {
    return { stored, result: { status: "needs-review", platform, operation: null, calls: 0 } };
  }

  if (options.item.media.kind === "carousel" && state.status === "pending") {
    if (state.carousel && state.carousel.children.length !== options.item.media.images.length) {
      markNeedsReview(state, "Persisted carousel length differs from the queue; zero Meta calls made.");
      stored = await options.save(stored);
      return { stored, result: { status: "needs-review", platform, operation: null, calls: 0 } };
    }
    state.carousel ??= carouselState(options.item.media.images.length);
    state.status = "building_carousel";
    stored = await options.save(stored);
  }

  if (isFuture(state.nextActionAt, options.now)) {
    return {
      stored,
      result: { status: "waiting", platform, operation: null, calls: 0, nextActionAt: state.nextActionAt },
    };
  }
  if (state.status === "container_created") {
    state.status = "waiting_for_media";
    state.nextActionAt = null;
    stored = await options.save(stored);
    return { stored, result: { status: "state-advanced", platform, operation: null, calls: 0 } };
  }

  const planned = options.item.media.kind === "carousel"
    ? carouselOperationFor(platform, state)
    : imageOperationFor(platform, state);
  if (!planned) {
    markNeedsReview(state, `No safe transition exists for ${platform}:${state.status}; zero Meta calls made.`);
    stored = await options.save(stored);
    return { stored, result: { status: "needs-review", platform, operation: null, calls: 0 } };
  }

  const callBudget = metaCallBudget(options.item);
  if (stored.state.metaCalls >= callBudget) {
    markNeedsReview(state, `Hard Meta call budget ${callBudget} reached; zero additional calls made.`);
    stored = await options.save(stored);
    return { stored, result: { status: "needs-review", platform, operation: null, calls: 0 } };
  }

  const correlationId = randomUUID();
  state.inFlight = {
    operation: planned.operation,
    carouselIndex: planned.carouselIndex,
    correlationId,
    startedAt: options.now.toISOString(),
  };
  stored.state.metaCalls += 1;
  stored = await options.save(stored);

  try {
    await options.consumeAuthorization({
      occurrence: options.occurrence,
      platform,
      operation: planned.operation,
      carouselIndex: planned.carouselIndex,
      correlationId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    markNeedsReview(state, `One-shot authorization could not be consumed (${message}); zero Meta calls made.`);
    stored = await options.save(stored);
    return {
      stored,
      result: { status: "needs-review", platform, operation: planned.operation, carouselIndex: planned.carouselIndex, calls: 0 },
    };
  }

  let metaResult: StudioMetaResult;
  try {
    metaResult = await (options.performOperation ?? performStudioMetaOperation)({
      operation: planned.operation,
      carouselIndex: planned.carouselIndex,
      occurrence: options.occurrence,
      correlationId,
      item: options.item,
      platformState: state,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    markNeedsReview(state, `${message}; automatic repetition is disabled.`);
    stored = await options.save(stored);
    if (error instanceof MetaPublishingError && error.kind === "brand-critical") {
      await pauseBestEffort(options.pauseBrand, `${platform}: ${message}`);
    }
    return {
      stored,
      result: { status: "needs-review", platform, operation: planned.operation, carouselIndex: planned.carouselIndex, calls: 1 },
    };
  }

  try {
    applySuccess(state, planned, metaResult, options.now);
  } catch (error) {
    markNeedsReview(state, error instanceof Error ? error.message : String(error));
  }
  stored = await options.save(stored);

  if (metaResult.pauseReason) {
    await pauseBestEffort(options.pauseBrand, `${platform}: ${metaResult.pauseReason}`);
  }
  return {
    stored,
    result: {
      status: completedStatus(state.status),
      platform,
      operation: planned.operation,
      carouselIndex: planned.carouselIndex,
      calls: 1,
      nextActionAt: state.nextActionAt,
      pausedReason: metaResult.pauseReason,
    },
  };
}
