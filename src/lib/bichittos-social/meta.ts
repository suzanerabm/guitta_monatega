import type { PublicationItem } from "./types";

type IdPayload = { id?: string; post_id?: string; access_token?: string; status_code?: string; status?: string; error?: { message?: string; error_user_msg?: string } };

// Política pós-incidente de 15/10/2026 (docs/meta-social-publishing-incident-2026-10-15.md):
// nenhuma chamada à Meta é repetida. Cada container recebe uma única espera local, sem chamadas,
// seguida de uma única consulta de status. Se não estiver pronto, a ocorrência vai para revisão.
export const PROCESSING_WAIT_MS = 60_000;
export const REEL_PROCESSING_WAIT_MS = 120_000;

const env = (name: string): string => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is not configured.`);
  return value;
};

const graph = () => `https://graph.facebook.com/${env("BICHITTOS_META_GRAPH_API_VERSION")}`;
const sleep = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

class CallBudget {
  private used = 0;
  constructor(private readonly limit: number, private readonly label: string) {}
  async fetch(input: string | URL, init?: RequestInit): Promise<Response> {
    if (this.used >= this.limit) throw new Error(`${this.label}: Meta call budget of ${this.limit} exhausted; stopping without retry.`);
    this.used += 1;
    return fetch(input, init);
  }
}

export function instagramCallLimit(item: PublicationItem): number {
  // carrossel: N itens + N consultas + container + consulta + publicação + verificação
  return item.media.kind === "carousel" ? item.media.images.length * 2 + 4 : 4;
}

export function facebookCallLimit(item: PublicationItem): number {
  // Page token + N fotos (ou 1 publicação) + feed do carrossel + verificação
  return item.media.kind === "carousel" ? item.media.images.length + 3 : 3;
}

async function json(response: Response, operation: string): Promise<IdPayload> {
  const payload = await response.json().catch(() => ({})) as IdPayload;
  if (!response.ok || payload.error) throw new Error(`${operation}: ${payload.error?.error_user_msg ?? payload.error?.message ?? `HTTP ${response.status}`}`);
  return payload;
}

async function post(budget: CallBudget, path: string, fields: Record<string, string>, token: string, operation: string): Promise<IdPayload> {
  return json(await budget.fetch(`${graph()}/${path}`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(fields),
  }), operation);
}

async function verifyPublished(budget: CallBudget, id: string, token: string, operation: string): Promise<void> {
  const url = new URL(`${graph()}/${id}`);
  url.searchParams.set("fields", "id");
  const published = await json(await budget.fetch(url, {
    headers: { authorization: `Bearer ${token}` },
  }), operation);
  if (published.id !== id) throw new Error(`${operation}: Meta did not confirm the published object.`);
}

async function pageToken(budget: CallBudget): Promise<string> {
  const response = await budget.fetch(`${graph()}/${env("BICHITTOS_FACEBOOK_PAGE_ID")}?fields=id,access_token`, {
    headers: { authorization: `Bearer ${env("BICHITTOS_META_ACCESS_TOKEN")}` },
  });
  const payload = await json(response, "get Facebook Page token");
  if (!payload.access_token) throw new Error("Facebook did not return a Page token.");
  return payload.access_token;
}

async function checkReadyOnce(budget: CallBudget, creationId: string, token: string, label: string): Promise<void> {
  const statusUrl = new URL(`${graph()}/${creationId}`);
  statusUrl.searchParams.set("fields", "status_code,status");
  const status = await json(await budget.fetch(statusUrl, {
    headers: { authorization: `Bearer ${token}` },
  }), `check Instagram ${label} processing`);
  if (status.status_code === "FINISHED") return;
  throw new Error(`Instagram ${label} is ${status.status_code ?? "UNKNOWN"} after a single check (${status.status ?? "no details"}); needs review, no retry.`);
}

async function publishInstagram(item: PublicationItem): Promise<string> {
  const account = env("BICHITTOS_INSTAGRAM_USER_ID");
  const token = env("BICHITTOS_META_ACCESS_TOKEN");
  const budget = new CallBudget(instagramCallLimit(item), "Instagram");
  let creationId: string;

  if (item.media.kind === "carousel") {
    const childIds: string[] = [];
    for (const image of item.media.images) {
      const child = await post(budget, `${account}/media`, { image_url: image.url, is_carousel_item: "true" }, token, "create Instagram carousel item");
      if (!child.id) throw new Error("Instagram did not return a carousel item ID.");
      childIds.push(child.id);
    }
    await sleep(PROCESSING_WAIT_MS);
    for (const childId of childIds) await checkReadyOnce(budget, childId, token, "carousel item");
    const container = await post(budget, `${account}/media`, { media_type: "CAROUSEL", children: childIds.join(","), caption: item.instagram.caption }, token, "create Instagram carousel");
    if (!container.id) throw new Error("Instagram did not return a carousel container ID.");
    creationId = container.id;
    await sleep(PROCESSING_WAIT_MS);
    await checkReadyOnce(budget, creationId, token, "carousel");
  } else if (item.media.kind === "reel") {
    const container = await post(budget, `${account}/media`, {
      media_type: "REELS",
      video_url: item.media.video.url,
      cover_url: item.media.cover.url,
      caption: item.instagram.caption,
      share_to_feed: "true",
    }, token, "create Instagram Reel");
    if (!container.id) throw new Error("Instagram did not return a Reel container ID.");
    creationId = container.id;

    await sleep(REEL_PROCESSING_WAIT_MS);
    await checkReadyOnce(budget, creationId, token, "Reel");
  } else {
    const container = await post(budget, `${account}/media`, { image_url: item.media.image.url, caption: item.instagram.caption }, token, "create Instagram image");
    if (!container.id) throw new Error("Instagram did not return an image container ID.");
    creationId = container.id;
    await sleep(PROCESSING_WAIT_MS);
    await checkReadyOnce(budget, creationId, token, "image");
  }

  const published = await post(budget, `${account}/media_publish`, { creation_id: creationId }, token, "publish on Instagram");
  if (!published.id) throw new Error("Instagram did not return the published media ID.");
  await verifyPublished(budget, published.id, token, "verify Instagram publication");
  return published.id;
}

async function publishFacebook(item: PublicationItem): Promise<string> {
  const page = env("BICHITTOS_FACEBOOK_PAGE_ID");
  const budget = new CallBudget(facebookCallLimit(item), "Facebook");
  const token = await pageToken(budget);

  if (item.media.kind === "carousel") {
    const photoIds: string[] = [];
    for (const image of item.media.images) {
      const photo = await post(budget, `${page}/photos`, { url: image.url, published: "false" }, token, "upload Facebook carousel item");
      if (!photo.id) throw new Error("Facebook did not return a carousel photo ID.");
      photoIds.push(photo.id);
    }
    const fields: Record<string, string> = { message: item.facebook.message };
    photoIds.forEach((id, index) => { fields[`attached_media[${index}]`] = JSON.stringify({ media_fbid: id }); });
    const published = await post(budget, `${page}/feed`, fields, token, "publish Facebook carousel");
    if (!published.id) throw new Error("Facebook did not return a carousel post ID.");
    await verifyPublished(budget, published.id, token, "verify Facebook carousel publication");
    return published.id;
  }

  if (item.media.kind === "reel") {
    const published = await post(budget, `${page}/videos`, { file_url: item.media.video.url, description: item.facebook.message }, token, "publish Facebook video");
    if (!published.id) throw new Error("Facebook did not return a video ID.");
    await verifyPublished(budget, published.id, token, "verify Facebook video publication");
    return published.id;
  }

  const published = await post(budget, `${page}/photos`, { url: item.media.image.url, message: item.facebook.message }, token, "publish Facebook photo");
  if (!published.id) throw new Error("Facebook did not return a photo ID.");
  const publishedId = published.post_id ?? published.id;
  await verifyPublished(budget, publishedId, token, "verify Facebook photo publication");
  return publishedId;
}

export const publishers = { instagram: publishInstagram, facebook: publishFacebook };
