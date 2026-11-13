import { GetObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { awsCredentialsProvider } from "@vercel/oidc-aws-credentials-provider";
import { isPublicationScheduledForToday, studioCalendarDate } from "./select-due";
import type { MetaCallAuthorization, MetaOperation, Platform, PlatformState, PublicationItem, PublicationState } from "./types";

export type StoredState = { state: PublicationState; etag: string };

const client = new S3Client({
  region: process.env.GUITTA_STUDIO_AWS_REGION ?? "us-east-1",
  credentials: awsCredentialsProvider({ roleArn: process.env.GUITTA_STUDIO_AWS_ROLE_ARN ?? "" }),
  maxAttempts: 4,
});

const bucket = () => {
  const value = process.env.GUITTA_STUDIO_AUTOMATION_BUCKET?.trim();
  if (!value) throw new Error("GUITTA_STUDIO_AUTOMATION_BUCKET is not configured.");
  return value;
};

const key = (occurrence: string) => `publications/guitta-monatega-studio/${occurrence}.json`;

async function read(occurrence: string): Promise<StoredState | null> {
  try {
    const output = await client.send(new GetObjectCommand({ Bucket: bucket(), Key: key(occurrence) }));
    if (!output.Body || !output.ETag) throw new Error("Publication state object is incomplete.");
    return { state: JSON.parse(await output.Body.transformToString()) as PublicationState, etag: output.ETag };
  } catch (error) {
    if ((error as { name?: string }).name === "NoSuchKey") return null;
    throw error;
  }
}

export async function readPublicationState(occurrence: string): Promise<PublicationState | null> {
  return (await read(occurrence))?.state ?? null;
}

async function write(state: PublicationState, etag?: string): Promise<StoredState> {
  const output = await client.send(new PutObjectCommand({
    Bucket: bucket(), Key: key(state.occurrence), Body: `${JSON.stringify(state, null, 2)}\n`,
    ContentType: "application/json", ServerSideEncryption: "AES256",
    ...(etag ? { IfMatch: etag } : { IfNoneMatch: "*" }),
  }));
  if (!output.ETag) throw new Error("S3 did not return the publication state ETag.");
  return { state, etag: output.ETag };
}

export type AcquireResult = { status: "acquired"; stored: StoredState } | { status: "published" } | { status: "locked" };

function initialPlatformState(): PlatformState {
  return {
    status: "pending",
    externalId: null,
    containerId: null,
    nextActionAt: null,
    statusChecks: 0,
    inFlight: null,
    carousel: null,
    error: null,
  };
}

export async function acquire(occurrence: string, now: Date, owner: string): Promise<AcquireResult> {
  const current = await read(occurrence);
  if (current?.state.instagram.status === "published" && current.state.facebook.status === "published") return { status: "published" };
  if (current && new Date(current.state.lockUntil) > now && current.state.lockOwner !== owner) return { status: "locked" };
  if (current && current.state.schemaVersion !== 3) {
    throw new Error(`Occurrence ${occurrence} uses legacy state and requires a human migration before any Meta call.`);
  }
  if (current && [current.state.instagram, current.state.facebook].some((platform) => platform.inFlight || platform.status === "needs_review" || platform.status === "brand_paused")) {
    throw new Error(`Occurrence ${occurrence} needs human review; automatic recovery is disabled.`);
  }
  const state: PublicationState = current?.state ?? {
    schemaVersion: 3,
    occurrence,
    lockOwner: owner,
    lockUntil: now.toISOString(),
    updatedAt: now.toISOString(),
    metaCalls: 0,
    instagram: initialPlatformState(),
    facebook: initialPlatformState(),
  };
  state.lockOwner = owner;
  state.lockUntil = new Date(now.getTime() + 4 * 60 * 1000).toISOString();
  state.updatedAt = now.toISOString();
  try {
    return { status: "acquired", stored: await write(state, current?.etag) };
  } catch (error) {
    if ((error as { name?: string }).name === "PreconditionFailed") return { status: "locked" };
    throw error;
  }
}

export async function save(stored: StoredState): Promise<StoredState> {
  stored.state.updatedAt = new Date().toISOString();
  return write(stored.state, stored.etag);
}

export async function verifyStateAccess(): Promise<void> {
  await client.send(new ListObjectsV2Command({ Bucket: bucket(), Prefix: "publications/guitta-monatega-studio/", MaxKeys: 1 }));
}

// Interruptor persistente da marca (circuit breaker). Sem o objeto, a marca está desligada.
// Religar exige uma pessoa gravando publishingEnabled: true neste objeto no S3.
export type BrandControl = {
  publishingEnabled: boolean;
  allowedOccurrence: string | null;
  allowedPlatforms: Platform[];
  allowedOperation: MetaOperation | null;
  allowedCarouselIndex: number | null;
  authorizationExpiresAt: string | null;
  pauseReason: string | null;
  pausedAt: string | null;
  pausedBy: "system" | "human" | null;
};

const controlKey = "publications/guitta-monatega-studio/_control.json";
const metaOperations = new Set<MetaOperation>([
  "create_instagram_container",
  "create_instagram_carousel_child",
  "check_instagram_carousel_child",
  "create_instagram_carousel_container",
  "check_instagram_container",
  "publish_instagram_media",
  "confirm_instagram_media",
  "publish_facebook_image",
  "create_facebook_carousel_child",
  "publish_facebook_carousel",
  "confirm_facebook_media",
]);

function isMetaOperation(value: unknown): value is MetaOperation {
  return typeof value === "string" && metaOperations.has(value as MetaOperation);
}

export async function readBrandControl(): Promise<BrandControl> {
  try {
    const output = await client.send(new GetObjectCommand({ Bucket: bucket(), Key: controlKey }));
    const control = JSON.parse(await output.Body!.transformToString()) as Partial<BrandControl>;
    const allowedPlatforms = Array.isArray(control.allowedPlatforms)
      ? control.allowedPlatforms.filter((platform): platform is Platform => platform === "instagram" || platform === "facebook")
      : [];
    return {
      publishingEnabled: control.publishingEnabled === true,
      allowedOccurrence: typeof control.allowedOccurrence === "string" && control.allowedOccurrence.length > 0 ? control.allowedOccurrence : null,
      allowedPlatforms,
      allowedOperation: isMetaOperation(control.allowedOperation) ? control.allowedOperation : null,
      allowedCarouselIndex: Number.isInteger(control.allowedCarouselIndex) ? control.allowedCarouselIndex as number : null,
      authorizationExpiresAt: typeof control.authorizationExpiresAt === "string" ? control.authorizationExpiresAt : null,
      pauseReason: control.pauseReason ?? null,
      pausedAt: control.pausedAt ?? null,
      pausedBy: control.pausedBy ?? null,
    };
  } catch (error) {
    if ((error as { name?: string }).name === "NoSuchKey") {
      return {
        publishingEnabled: false,
        allowedOccurrence: null,
        allowedPlatforms: [],
        allowedOperation: null,
        allowedCarouselIndex: null,
        authorizationExpiresAt: null,
        pauseReason: "Publishing has never been enabled for this brand.",
        pausedAt: null,
        pausedBy: null,
      };
    }
    throw error;
  }
}

// Every manual authorization is a one-shot fuse. It is turned off with a conditional S3 write
// before the Meta request starts. A concurrent or repeated execution cannot reuse it.
export async function consumeBrandAuthorization(
  expected: MetaCallAuthorization,
  now = new Date(),
): Promise<void> {
  const output = await client.send(new GetObjectCommand({ Bucket: bucket(), Key: controlKey }));
  if (!output.Body || !output.ETag) throw new Error("Brand authorization object is incomplete.");
  const control = JSON.parse(await output.Body.transformToString()) as Partial<BrandControl>;
  const expiresAt = typeof control.authorizationExpiresAt === "string"
    ? new Date(control.authorizationExpiresAt)
    : null;
  const exactPlatform = Array.isArray(control.allowedPlatforms)
    && control.allowedPlatforms.length === 1
    && control.allowedPlatforms[0] === expected.platform;
  if (
    control.publishingEnabled !== true
    || control.allowedOccurrence !== expected.occurrence
    || !exactPlatform
    || control.allowedOperation !== expected.operation
    || (Number.isInteger(control.allowedCarouselIndex) ? control.allowedCarouselIndex : null) !== expected.carouselIndex
    || !expiresAt
    || !Number.isFinite(expiresAt.getTime())
    || expiresAt <= now
  ) {
    throw new Error("Brand authorization is absent, expired or does not match this exact operation.");
  }

  const consumed: BrandControl = {
    publishingEnabled: false,
    allowedOccurrence: null,
    allowedPlatforms: [],
    allowedOperation: null,
    allowedCarouselIndex: null,
    authorizationExpiresAt: null,
    pauseReason: `One-shot authorization consumed before ${expected.platform}:${expected.operation} (${expected.correlationId}).`,
    pausedAt: now.toISOString(),
    pausedBy: "system",
  };
  await client.send(new PutObjectCommand({
    Bucket: bucket(),
    Key: controlKey,
    Body: `${JSON.stringify(consumed, null, 2)}\n`,
    ContentType: "application/json",
    ServerSideEncryption: "AES256",
    IfMatch: output.ETag,
  }));
}

export async function pauseBrand(reason: string, now = new Date()): Promise<void> {
  const control: BrandControl = {
    publishingEnabled: false,
    allowedOccurrence: null,
    allowedPlatforms: [],
    allowedOperation: null,
    allowedCarouselIndex: null,
    authorizationExpiresAt: null,
    pauseReason: reason,
    pausedAt: now.toISOString(),
    pausedBy: "system",
  };
  await client.send(new PutObjectCommand({
    Bucket: bucket(),
    Key: controlKey,
    Body: `${JSON.stringify(control, null, 2)}\n`,
    ContentType: "application/json",
    ServerSideEncryption: "AES256",
  }));
}

// Controle separado do cron: ele nunca aceita Facebook ou Reel e tem um teto diário fixo.
// O controle manual descartável acima continua isolado para testes supervisionados.
export type StudioScheduleControl = {
  schemaVersion: 1;
  enabled: boolean;
  callsDate: string | null;
  callsToday: number;
  lastAuthorization: {
    occurrence: string;
    operation: MetaOperation;
    carouselIndex: number | null;
    correlationId: string;
    authorizedAt: string;
  } | null;
  pauseReason: string | null;
  pausedAt: string | null;
  pausedBy: "system" | "human" | null;
};

const scheduleControlKey = "publications/guitta-monatega-studio/_schedule-control.json";
export const STUDIO_SCHEDULE_MAX_META_CALLS_PER_DAY = 32;

type StoredScheduleControl = { control: StudioScheduleControl; etag: string | null };

function disabledScheduleControl(): StudioScheduleControl {
  return {
    schemaVersion: 1,
    enabled: false,
    callsDate: null,
    callsToday: 0,
    lastAuthorization: null,
    pauseReason: "Studio scheduled publishing has never been enabled.",
    pausedAt: null,
    pausedBy: null,
  };
}

async function readStoredScheduleControl(): Promise<StoredScheduleControl> {
  try {
    const output = await client.send(new GetObjectCommand({ Bucket: bucket(), Key: scheduleControlKey }));
    if (!output.Body || !output.ETag) throw new Error("Studio schedule control object is incomplete.");
    const value = JSON.parse(await output.Body.transformToString()) as Partial<StudioScheduleControl>;
    if (value.schemaVersion !== 1) throw new Error("Studio schedule control uses an unsupported schema.");
    return {
      control: {
        schemaVersion: 1,
        enabled: value.enabled === true,
        callsDate: typeof value.callsDate === "string" ? value.callsDate : null,
        callsToday: Number.isInteger(value.callsToday) && (value.callsToday ?? -1) >= 0 ? value.callsToday! : 0,
        lastAuthorization: value.lastAuthorization ?? null,
        pauseReason: value.pauseReason ?? null,
        pausedAt: value.pausedAt ?? null,
        pausedBy: value.pausedBy ?? null,
      },
      etag: output.ETag,
    };
  } catch (error) {
    if ((error as { name?: string }).name === "NoSuchKey") return { control: disabledScheduleControl(), etag: null };
    throw error;
  }
}

async function writeScheduleControl(stored: StoredScheduleControl): Promise<void> {
  await client.send(new PutObjectCommand({
    Bucket: bucket(),
    Key: scheduleControlKey,
    Body: `${JSON.stringify(stored.control, null, 2)}\n`,
    ContentType: "application/json",
    ServerSideEncryption: "AES256",
    ...(stored.etag ? { IfMatch: stored.etag } : { IfNoneMatch: "*" }),
  }));
}

export async function readStudioScheduleControl(): Promise<StudioScheduleControl> {
  return (await readStoredScheduleControl()).control;
}

export async function consumeStudioScheduleAuthorization(
  expected: MetaCallAuthorization,
  item: PublicationItem,
  now = new Date(),
): Promise<void> {
  if (expected.platform !== "instagram") {
    throw new Error("Studio cron is restricted to Instagram.");
  }
  if (item.media.kind !== "image" && item.media.kind !== "carousel") {
    throw new Error("Studio cron accepts only image and carousel publications.");
  }
  if (item.occurrence !== expected.occurrence || !isPublicationScheduledForToday(item, now)) {
    throw new Error("Studio cron authorization is not for today's exact occurrence.");
  }

  const stored = await readStoredScheduleControl();
  if (!stored.control.enabled) throw new Error("Studio scheduled publishing is paused.");
  const callsDate = studioCalendarDate(now);
  const callsToday = stored.control.callsDate === callsDate ? stored.control.callsToday : 0;
  if (callsToday >= STUDIO_SCHEDULE_MAX_META_CALLS_PER_DAY) {
    throw new Error(`Studio daily Meta call limit ${STUDIO_SCHEDULE_MAX_META_CALLS_PER_DAY} reached.`);
  }

  stored.control.callsDate = callsDate;
  stored.control.callsToday = callsToday + 1;
  stored.control.lastAuthorization = {
    occurrence: expected.occurrence,
    operation: expected.operation,
    carouselIndex: expected.carouselIndex,
    correlationId: expected.correlationId,
    authorizedAt: now.toISOString(),
  };
  await writeScheduleControl(stored);
}

export async function pauseStudioSchedule(reason: string, now = new Date()): Promise<void> {
  const stored = await readStoredScheduleControl();
  stored.control.enabled = false;
  stored.control.pauseReason = reason;
  stored.control.pausedAt = now.toISOString();
  stored.control.pausedBy = "system";
  await writeScheduleControl(stored);
}
