import { randomUUID } from "node:crypto";
import { MetaPublishingError } from "@/lib/social-meta/client";
import { performStudioMetaOperation, type StudioMetaResult } from "./meta";
import type { StoredState } from "./state";
import type { MetaOperation, Platform, PlatformState, PlatformStatus, PublicationItem } from "./types";

const FIRST_STATUS_DELAY_MS = 60_000;
const CONFIRM_DELAY_MS = 5 * 60_000;
const STATUS_RECHECK_DELAYS_MS = [5 * 60_000, 15 * 60_000] as const;
const MAX_STATUS_CHECKS = 3;

type PerformOperation = typeof performStudioMetaOperation;

export type SafeStepResult = {
  status: "waiting" | "state-advanced" | "meta-call-completed" | "published" | "needs-review" | "platform-not-authorized";
  platform: Platform | null;
  operation: MetaOperation | null;
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

function operationFor(platform: Platform, state: PlatformState): MetaOperation | null {
  if (platform === "instagram") {
    if (state.status === "pending") return "create_instagram_container";
    if (state.status === "waiting_for_media") return "check_instagram_container";
    if (state.status === "media_ready") return "publish_instagram_media";
    if (state.status === "publish_requested") return "confirm_instagram_media";
    return null;
  }
  if (state.status === "pending") return "publish_facebook_image";
  if (state.status === "publish_requested") return "confirm_facebook_media";
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

function applySuccess(state: PlatformState, operation: MetaOperation, result: StudioMetaResult, now: Date): void {
  state.inFlight = null;
  state.error = null;
  switch (operation) {
    case "create_instagram_container":
      state.containerId = requireResultId(result, operation);
      state.status = "container_created";
      state.nextActionAt = isoAfter(now, FIRST_STATUS_DELAY_MS);
      return;
    case "check_instagram_container": {
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
      return;
    }
    case "publish_instagram_media":
    case "publish_facebook_image":
      state.externalId = requireResultId(result, operation);
      state.status = "publish_requested";
      state.nextActionAt = isoAfter(now, CONFIRM_DELAY_MS);
      return;
    case "confirm_instagram_media":
    case "confirm_facebook_media":
      requireResultId(result, operation);
      state.status = "published";
      state.nextActionAt = null;
      return;
  }
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
  if (options.item.media.kind !== "image") {
    markNeedsReview(state, `Safe Studio publisher supports image only; ${options.item.media.kind} requires a separately reviewed state machine.`);
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

  const operation = operationFor(platform, state);
  if (!operation) {
    markNeedsReview(state, `No safe transition exists for ${platform}:${state.status}; zero Meta calls made.`);
    stored = await options.save(stored);
    return { stored, result: { status: "needs-review", platform, operation: null, calls: 0 } };
  }

  const correlationId = randomUUID();
  state.inFlight = { operation, correlationId, startedAt: options.now.toISOString() };
  stored = await options.save(stored);

  let metaResult: StudioMetaResult;
  try {
    metaResult = await (options.performOperation ?? performStudioMetaOperation)({
      operation,
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
    return { stored, result: { status: "needs-review", platform, operation, calls: 1 } };
  }

  try {
    applySuccess(state, operation, metaResult, options.now);
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
      operation,
      calls: 1,
      nextActionAt: state.nextActionAt,
      pausedReason: metaResult.pauseReason,
    },
  };
}
