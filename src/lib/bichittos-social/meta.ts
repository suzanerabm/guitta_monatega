import type { PublicationItem } from "./types";

type IdPayload = { id?: string; post_id?: string; access_token?: string; status_code?: string; status?: string; error?: { message?: string; error_user_msg?: string } };

const env = (name: string): string => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is not configured.`);
  return value;
};

const graph = () => `https://graph.facebook.com/${env("BICHITTOS_META_GRAPH_API_VERSION")}`;

async function json(response: Response, operation: string): Promise<IdPayload> {
  const payload = await response.json().catch(() => ({})) as IdPayload;
  if (!response.ok || payload.error) throw new Error(`${operation}: ${payload.error?.error_user_msg ?? payload.error?.message ?? `HTTP ${response.status}`}`);
  return payload;
}

async function post(path: string, fields: Record<string, string>, token: string, operation: string): Promise<IdPayload> {
  return json(await fetch(`${graph()}/${path}`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ ...fields, access_token: token }),
  }), operation);
}

async function pageToken(): Promise<string> {
  const response = await fetch(`${graph()}/${env("BICHITTOS_FACEBOOK_PAGE_ID")}?fields=id,access_token`, {
    headers: { authorization: `Bearer ${env("BICHITTOS_META_ACCESS_TOKEN")}` },
  });
  const payload = await json(response, "get Facebook Page token");
  if (!payload.access_token) throw new Error("Facebook did not return a Page token.");
  return payload.access_token;
}

async function publishInstagram(item: PublicationItem): Promise<string> {
  const account = env("BICHITTOS_INSTAGRAM_USER_ID");
  const token = env("BICHITTOS_META_ACCESS_TOKEN");
  let creationId: string;

  if (item.media.kind === "carousel") {
    const childIds: string[] = [];
    for (const image of item.media.images) {
      const child = await post(`${account}/media`, { image_url: image.url, is_carousel_item: "true" }, token, "create Instagram carousel item");
      if (!child.id) throw new Error("Instagram did not return a carousel item ID.");
      childIds.push(child.id);
    }
    const container = await post(`${account}/media`, { media_type: "CAROUSEL", children: childIds.join(","), caption: item.instagram.caption }, token, "create Instagram carousel");
    if (!container.id) throw new Error("Instagram did not return a carousel container ID.");
    creationId = container.id;
  } else if (item.media.kind === "reel") {
    const container = await post(`${account}/media`, {
      media_type: "REELS",
      video_url: item.media.video.url,
      cover_url: item.media.cover.url,
      caption: item.instagram.caption,
      share_to_feed: "true",
    }, token, "create Instagram Reel");
    if (!container.id) throw new Error("Instagram did not return a Reel container ID.");
    creationId = container.id;

    let ready = false;
    for (let attempt = 0; attempt < 75; attempt += 1) {
      const statusUrl = new URL(`${graph()}/${creationId}`);
      statusUrl.searchParams.set("fields", "status_code,status");
      statusUrl.searchParams.set("access_token", token);
      const status = await json(await fetch(statusUrl), "check Instagram Reel processing");
      if (status.status_code === "FINISHED") { ready = true; break; }
      if (["ERROR", "EXPIRED"].includes(status.status_code ?? "")) throw new Error(`Instagram Reel processing ended as ${status.status_code}: ${status.status ?? "no details"}`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
    if (!ready) throw new Error("Instagram Reel was not ready within 150 seconds.");
  } else {
    const container = await post(`${account}/media`, { image_url: item.media.image.url, caption: item.instagram.caption }, token, "create Instagram image");
    if (!container.id) throw new Error("Instagram did not return an image container ID.");
    creationId = container.id;
  }

  const published = await post(`${account}/media_publish`, { creation_id: creationId }, token, "publish on Instagram");
  if (!published.id) throw new Error("Instagram did not return the published media ID.");
  return published.id;
}

async function publishFacebook(item: PublicationItem): Promise<string> {
  const page = env("BICHITTOS_FACEBOOK_PAGE_ID");
  const token = await pageToken();
  if (item.media.kind === "carousel") {
    const photoIds: string[] = [];
    for (const image of item.media.images) {
      const photo = await post(`${page}/photos`, { url: image.url, published: "false" }, token, "upload Facebook carousel item");
      if (!photo.id) throw new Error("Facebook did not return a carousel photo ID.");
      photoIds.push(photo.id);
    }
    const fields: Record<string, string> = { message: item.facebook.message };
    photoIds.forEach((id, index) => { fields[`attached_media[${index}]`] = JSON.stringify({ media_fbid: id }); });
    const published = await post(`${page}/feed`, fields, token, "publish Facebook carousel");
    if (!published.id) throw new Error("Facebook did not return a carousel post ID.");
    return published.id;
  }
  if (item.media.kind === "reel") {
    const published = await post(`${page}/videos`, { file_url: item.media.video.url, description: item.facebook.message }, token, "publish Facebook video");
    if (!published.id) throw new Error("Facebook did not return a video ID.");
    return published.id;
  }
  const published = await post(`${page}/photos`, { url: item.media.image.url, message: item.facebook.message }, token, "publish Facebook photo");
  if (!published.id) throw new Error("Facebook did not return a photo ID.");
  return published.post_id ?? published.id;
}

export const publishers = { instagram: publishInstagram, facebook: publishFacebook };

