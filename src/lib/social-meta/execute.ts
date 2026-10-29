import { randomUUID } from "node:crypto";
import { MetaClient, MetaPublishingError, type MetaCallLog } from "./client";
import { facebookCallLimit, instagramCallLimit, type PlatformPublisher, type PublishableItem } from "./publishers";

type PlatformState = { status: "pending" | "publishing" | "published" | "needs_review"; externalId: string | null; error: string | null };
type StoredLike = { state: { instagram: PlatformState; facebook: PlatformState } };

export type PublishPlatformsOptions<S extends StoredLike> = {
  brand: string;
  occurrence: string;
  item: PublishableItem;
  stored: S;
  save: (stored: S) => Promise<S>;
  publishers: { instagram: PlatformPublisher; facebook: PlatformPublisher };
  // Desliga a marca de forma persistente; só uma pessoa religa.
  pauseBrand: (reason: string) => Promise<void>;
  correlationId?: string;
  fetchImpl?: typeof fetch;
  log?: (entry: MetaCallLog) => void;
};

const limits = { instagram: instagramCallLimit, facebook: facebookCallLimit };

// Publica Instagram e depois Facebook, cada um uma única vez. Qualquer falha deixa a plataforma
// em needs_review; falhas de token, permissão, bloqueio, limite ou uso alto também pausam a marca.
export async function publishPlatforms<S extends StoredLike>(options: PublishPlatformsOptions<S>): Promise<{ stored: S; pausedReason: string | null }> {
  const correlationId = options.correlationId ?? randomUUID();
  let stored = options.stored;

  const pause = async (reason: string) => {
    try {
      await options.pauseBrand(reason);
    } catch (error) {
      console.error(JSON.stringify({ event: "brand_pause_failed", brand: options.brand, reason, error: error instanceof Error ? error.message : String(error) }));
    }
  };

  for (const platform of ["instagram", "facebook"] as const) {
    const platformState = stored.state[platform];
    if (platformState.status === "published") continue;

    const client = new MetaClient({
      brand: options.brand,
      occurrence: options.occurrence,
      platform,
      limit: limits[platform](options.item),
      correlationId,
      fetchImpl: options.fetchImpl,
      log: options.log,
    });

    platformState.status = "publishing";
    platformState.error = null;
    stored = await options.save(stored);
    try {
      platformState.externalId = await options.publishers[platform](options.item, client);
      platformState.status = "published";
    } catch (error) {
      platformState.status = "needs_review";
      platformState.error = error instanceof Error ? error.message : String(error);
      stored = await options.save(stored);
      const critical = error instanceof MetaPublishingError && error.kind === "brand-critical";
      const reason = critical ? `${platform}: ${(error as Error).message}` : client.pauseReason;
      if (reason) await pause(reason);
      throw error;
    }
    stored = await options.save(stored);
    if (client.pauseReason) {
      await pause(`${platform}: ${client.pauseReason}`);
      return { stored, pausedReason: client.pauseReason };
    }
  }
  return { stored, pausedReason: null };
}
