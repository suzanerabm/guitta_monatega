import { GetObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { awsCredentialsProvider } from "@vercel/oidc-aws-credentials-provider";
import type { Platform, PlatformState, PublicationState } from "./types";

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
    error: null,
  };
}

export async function acquire(occurrence: string, now: Date, owner: string): Promise<AcquireResult> {
  const current = await read(occurrence);
  if (current?.state.instagram.status === "published" && current.state.facebook.status === "published") return { status: "published" };
  if (current && new Date(current.state.lockUntil) > now && current.state.lockOwner !== owner) return { status: "locked" };
  if (current && current.state.schemaVersion !== 2) {
    throw new Error(`Occurrence ${occurrence} uses legacy state and requires a human migration before any Meta call.`);
  }
  if (current && [current.state.instagram, current.state.facebook].some((platform) => platform.inFlight || platform.status === "needs_review" || platform.status === "brand_paused")) {
    throw new Error(`Occurrence ${occurrence} needs human review; automatic recovery is disabled.`);
  }
  const state: PublicationState = current?.state ?? {
    schemaVersion: 2,
    occurrence,
    lockOwner: owner,
    lockUntil: now.toISOString(),
    updatedAt: now.toISOString(),
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
  authorizationExpiresAt: string | null;
  pauseReason: string | null;
  pausedAt: string | null;
  pausedBy: "system" | "human" | null;
};

const controlKey = "publications/guitta-monatega-studio/_control.json";

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
        authorizationExpiresAt: null,
        pauseReason: "Publishing has never been enabled for this brand.",
        pausedAt: null,
        pausedBy: null,
      };
    }
    throw error;
  }
}

export async function pauseBrand(reason: string, now = new Date()): Promise<void> {
  const control: BrandControl = {
    publishingEnabled: false,
    allowedOccurrence: null,
    allowedPlatforms: [],
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
