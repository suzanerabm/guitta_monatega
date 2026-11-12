import { MetaClient, type MetaCallLog, type MetaPayload } from "@/lib/social-meta/client";
import type { MetaOperation, PlatformState, PublicationItem } from "./types";

// This module is deliberately limited to one Meta request per invocation. It contains no
// polling, sleep, loop or retry. The persisted state machine decides which single operation is
// allowed before calling this function.

type PerformMetaOperationOptions = {
  operation: MetaOperation;
  occurrence: string;
  correlationId: string;
  item: PublicationItem;
  platformState: PlatformState;
  fetchImpl?: typeof fetch;
  log?: (entry: MetaCallLog) => void;
};

export type StudioMetaResult = {
  id: string | null;
  statusCode: string | null;
  status: string | null;
  pauseReason: string | null;
};

function required(name: string): string {
  const value = process.env[`GUITTA_STUDIO_${name}`]?.trim();
  if (!value) throw new Error(`GUITTA_STUDIO_${name} is not configured.`);
  return value;
}

function imageUrl(item: PublicationItem): string {
  if (item.media.kind !== "image") throw new Error(`Safe Studio publisher does not support ${item.media.kind} yet; zero Meta calls made.`);
  return item.media.image.url;
}

function requireId(value: string | null, label: string): string {
  if (!value) throw new Error(`${label} is missing; zero Meta calls made.`);
  return value;
}

function result(payload: MetaPayload, client: MetaClient): StudioMetaResult {
  return {
    id: payload.post_id ?? payload.id ?? null,
    statusCode: payload.status_code ?? null,
    status: payload.status ?? null,
    pauseReason: client.pauseReason,
  };
}

export async function performStudioMetaOperation(options: PerformMetaOperationOptions): Promise<StudioMetaResult> {
  const version = required("META_GRAPH_API_VERSION");
  const graph = `https://graph.facebook.com/${version}`;
  const instagramToken = () => required("META_ACCESS_TOKEN");
  const facebookToken = () => required("FACEBOOK_PAGE_ACCESS_TOKEN");
  const platform = options.operation.includes("facebook") ? "facebook" : "instagram";
  const client = new MetaClient({
    brand: "guitta-studio",
    occurrence: options.occurrence,
    platform,
    limit: 1,
    correlationId: options.correlationId,
    fetchImpl: options.fetchImpl,
    log: options.log,
  });

  const post = (path: string, fields: Record<string, string>, token: string, label: string) =>
    client.request(label, `${graph}/${path}`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(fields),
    });

  const get = (path: string, fields: string, token: string, label: string) => {
    const url = new URL(`${graph}/${path}`);
    url.searchParams.set("fields", fields);
    return client.request(label, url, { headers: { authorization: `Bearer ${token}` } });
  };

  let payload: MetaPayload;
  switch (options.operation) {
    case "create_instagram_container":
      payload = await post(
        `${required("INSTAGRAM_USER_ID")}/media`,
        { image_url: imageUrl(options.item), caption: options.item.instagram.caption },
        instagramToken(),
        "create Instagram image container",
      );
      break;
    case "check_instagram_container":
      payload = await get(
        requireId(options.platformState.containerId, "Instagram container ID"),
        "status_code,status",
        instagramToken(),
        "check Instagram image container once",
      );
      break;
    case "publish_instagram_media":
      payload = await post(
        `${required("INSTAGRAM_USER_ID")}/media_publish`,
        { creation_id: requireId(options.platformState.containerId, "Instagram container ID") },
        instagramToken(),
        "publish Instagram image once",
      );
      break;
    case "confirm_instagram_media":
      payload = await get(
        requireId(options.platformState.externalId, "Instagram media ID"),
        "id",
        instagramToken(),
        "confirm Instagram image once",
      );
      break;
    case "publish_facebook_image":
      payload = await post(
        `${required("FACEBOOK_PAGE_ID")}/photos`,
        { url: imageUrl(options.item), message: options.item.facebook.message },
        facebookToken(),
        "publish Facebook image once",
      );
      break;
    case "confirm_facebook_media":
      payload = await get(
        requireId(options.platformState.externalId, "Facebook media ID"),
        "id",
        facebookToken(),
        "confirm Facebook image once",
      );
      break;
  }

  return result(payload, client);
}
