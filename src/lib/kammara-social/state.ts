import { GetObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { awsCredentialsProvider } from "@vercel/oidc-aws-credentials-provider";
import type { PublicationState } from "./types";

type StoredState = { state: PublicationState; etag: string };

const client = new S3Client({
  region: process.env.KAMMARA_AWS_REGION ?? "us-east-1",
  credentials: awsCredentialsProvider({ roleArn: process.env.KAMMARA_AWS_ROLE_ARN ?? "" }),
  maxAttempts: 4,
});

const bucket = () => {
  const value = process.env.KAMMARA_AUTOMATION_BUCKET?.trim();
  if (!value) throw new Error("KAMMARA_AUTOMATION_BUCKET is not configured.");
  return value;
};

const key = (occurrence: string) => `publications/kammara/${occurrence}.json`;

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
    Bucket: bucket(),
    Key: key(state.occurrence),
    Body: `${JSON.stringify(state, null, 2)}\n`,
    ContentType: "application/json",
    ServerSideEncryption: "AES256",
    ...(etag ? { IfMatch: etag } : { IfNoneMatch: "*" }),
  }));
  if (!output.ETag) throw new Error("S3 did not return the publication state ETag.");
  return { state, etag: output.ETag };
}

export async function acquire(occurrence: string, now: Date, owner: string): Promise<StoredState | null> {
  const current = await read(occurrence);
  if (current?.state.instagram.status === "published" && current.state.facebook.status === "published") return null;
  if (current && new Date(current.state.lockUntil) > now && current.state.lockOwner !== owner) return null;
  if (current && [current.state.instagram.status, current.state.facebook.status].some((status) => status === "publishing" || status === "needs_review")) {
    throw new Error(`Occurrence ${occurrence} needs review because a previous execution stopped during publishing.`);
  }

  const state: PublicationState = current?.state ?? {
    occurrence,
    lockOwner: owner,
    lockUntil: now.toISOString(),
    updatedAt: now.toISOString(),
    instagram: { status: "pending", externalId: null, error: null },
    facebook: { status: "pending", externalId: null, error: null },
  };
  state.lockOwner = owner;
  state.lockUntil = new Date(now.getTime() + 4 * 60 * 1000).toISOString();
  state.updatedAt = now.toISOString();

  try {
    return await write(state, current?.etag);
  } catch (error) {
    if ((error as { name?: string }).name === "PreconditionFailed") return null;
    throw error;
  }
}

export async function save(stored: StoredState): Promise<StoredState> {
  stored.state.updatedAt = new Date().toISOString();
  return write(stored.state, stored.etag);
}

export async function verifyStateAccess(): Promise<void> {
  await client.send(new ListObjectsV2Command({ Bucket: bucket(), Prefix: "publications/kammara/", MaxKeys: 1 }));
}
