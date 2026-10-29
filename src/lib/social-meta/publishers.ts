import type { MetaClient } from "./client";

// Publicadores Instagram e Facebook compartilhados. Cada marca cria os seus com o próprio
// prefixo de variáveis de ambiente; credenciais nunca são compartilhadas entre marcas.
//
// Chamadas por publicação:
// - Instagram imagem ou Reel: criar container, uma consulta de status, publicar (3);
// - Instagram carrossel de N imagens: N itens, N consultas, container, consulta, publicar (2N + 3);
// - Facebook foto ou vídeo: 1; carrossel de N imagens: N fotos + feed (N + 1).
// O token da Página vem de um segredo (<PREFIXO>_FACEBOOK_PAGE_ACCESS_TOKEN) e não é pedido à Meta.

export const PROCESSING_WAIT_MS = 60_000;
export const REEL_PROCESSING_WAIT_MS = 120_000;

type Media =
  | { kind: "image"; image: { url: string } }
  | { kind: "carousel"; images: Array<{ url: string }> }
  | { kind: "reel"; video: { url: string }; cover: { url: string } };

export type PublishableItem = {
  media: Media;
  instagram: { caption: string };
  facebook: { message: string };
};

export type PlatformPublisher = (item: PublishableItem, client: MetaClient) => Promise<string>;

const sleep = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

export function instagramCallLimit(item: PublishableItem): number {
  return item.media.kind === "carousel" ? item.media.images.length * 2 + 3 : 3;
}

export function facebookCallLimit(item: PublishableItem): number {
  return item.media.kind === "carousel" ? item.media.images.length + 1 : 1;
}

export function createMetaPublishers(prefix: string) {
  const env = (name: string): string => {
    const value = process.env[`${prefix}_${name}`]?.trim();
    if (!value) throw new Error(`${prefix}_${name} is not configured.`);
    return value;
  };
  const graph = () => `https://graph.facebook.com/${env("META_GRAPH_API_VERSION")}`;

  const post = async (client: MetaClient, path: string, fields: Record<string, string>, token: string, operation: string) =>
    client.request(operation, `${graph()}/${path}`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(fields),
    });

  const checkReadyOnce = async (client: MetaClient, creationId: string, token: string, label: string) => {
    const statusUrl = new URL(`${graph()}/${creationId}`);
    statusUrl.searchParams.set("fields", "status_code,status");
    const status = await client.request(`check Instagram ${label} processing`, statusUrl, {
      headers: { authorization: `Bearer ${token}` },
    });
    if (status.status_code === "FINISHED") return;
    throw new Error(`Instagram ${label} is ${status.status_code ?? "UNKNOWN"} after a single check (${status.status ?? "no details"}); needs review, no retry.`);
  };

  const instagram: PlatformPublisher = async (item, client) => {
    const account = env("INSTAGRAM_USER_ID");
    const token = env("META_ACCESS_TOKEN");
    let creationId: string;

    if (item.media.kind === "carousel") {
      const childIds: string[] = [];
      for (const image of item.media.images) {
        const child = await post(client, `${account}/media`, { image_url: image.url, is_carousel_item: "true" }, token, "create Instagram carousel item");
        if (!child.id) throw new Error("Instagram did not return a carousel item ID.");
        childIds.push(child.id);
      }
      await sleep(PROCESSING_WAIT_MS);
      for (const childId of childIds) await checkReadyOnce(client, childId, token, "carousel item");
      const container = await post(client, `${account}/media`, { media_type: "CAROUSEL", children: childIds.join(","), caption: item.instagram.caption }, token, "create Instagram carousel");
      if (!container.id) throw new Error("Instagram did not return a carousel container ID.");
      creationId = container.id;
      await sleep(PROCESSING_WAIT_MS);
      await checkReadyOnce(client, creationId, token, "carousel");
    } else if (item.media.kind === "reel") {
      const container = await post(client, `${account}/media`, {
        media_type: "REELS",
        video_url: item.media.video.url,
        cover_url: item.media.cover.url,
        caption: item.instagram.caption,
        share_to_feed: "true",
      }, token, "create Instagram Reel");
      if (!container.id) throw new Error("Instagram did not return a Reel container ID.");
      creationId = container.id;
      await sleep(REEL_PROCESSING_WAIT_MS);
      await checkReadyOnce(client, creationId, token, "Reel");
    } else {
      const container = await post(client, `${account}/media`, { image_url: item.media.image.url, caption: item.instagram.caption }, token, "create Instagram image");
      if (!container.id) throw new Error("Instagram did not return an image container ID.");
      creationId = container.id;
      await sleep(PROCESSING_WAIT_MS);
      await checkReadyOnce(client, creationId, token, "image");
    }

    const published = await post(client, `${account}/media_publish`, { creation_id: creationId }, token, "publish on Instagram");
    if (!published.id) throw new Error("Instagram did not return the published media ID.");
    return published.id;
  };

  const facebook: PlatformPublisher = async (item, client) => {
    const page = env("FACEBOOK_PAGE_ID");
    const token = env("FACEBOOK_PAGE_ACCESS_TOKEN");

    if (item.media.kind === "carousel") {
      const photoIds: string[] = [];
      for (const image of item.media.images) {
        const photo = await post(client, `${page}/photos`, { url: image.url, published: "false" }, token, "upload Facebook carousel item");
        if (!photo.id) throw new Error("Facebook did not return a carousel photo ID.");
        photoIds.push(photo.id);
      }
      const fields: Record<string, string> = { message: item.facebook.message };
      photoIds.forEach((id, index) => { fields[`attached_media[${index}]`] = JSON.stringify({ media_fbid: id }); });
      const published = await post(client, `${page}/feed`, fields, token, "publish Facebook carousel");
      if (!published.id) throw new Error("Facebook did not return a carousel post ID.");
      return published.id;
    }

    if (item.media.kind === "reel") {
      const published = await post(client, `${page}/videos`, { file_url: item.media.video.url, description: item.facebook.message }, token, "publish Facebook video");
      if (!published.id) throw new Error("Facebook did not return a video ID.");
      return published.id;
    }

    const published = await post(client, `${page}/photos`, { url: item.media.image.url, message: item.facebook.message }, token, "publish Facebook photo");
    if (!published.id) throw new Error("Facebook did not return a photo ID.");
    return published.post_id ?? published.id;
  };

  return { instagram, facebook };
}
