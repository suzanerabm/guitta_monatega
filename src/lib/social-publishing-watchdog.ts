import bichittosQueue from "@/lib/bichittos-social/publication-queue.json";
import { readBrandControl as readBichittosControl, readPublicationState as readBichittosState } from "@/lib/bichittos-social/state";
import studioQueue from "@/lib/guitta-studio-social/publication-queue.json";
import { readBrandControl as readStudioControl, readPublicationState as readStudioState } from "@/lib/guitta-studio-social/state";
import kammaraQueue from "@/lib/kammara-social/publication-queue.json";
import { readBrandControl as readKammaraControl, readPublicationState as readKammaraState } from "@/lib/kammara-social/state";
import { sendPublishingAlert, type PublishingBrand } from "@/lib/social-publishing-alerts";

type QueueItem = { occurrence: string; scheduledAt: string; postId?: string; title?: string; slug?: string };
type State = { instagram: { status: string }; facebook: { status: string } } | null;

const WINDOW_MS = 10 * 60 * 60 * 1000;

const campaigns: Array<{
  brand: PublishingBrand;
  items: QueueItem[];
  read: (occurrence: string) => Promise<State>;
  readControl: () => Promise<{ publishingEnabled: boolean }>;
}> = [
  { brand: "Kammara", items: kammaraQueue.items as QueueItem[], read: readKammaraState, readControl: readKammaraControl },
  { brand: "Bichittos", items: bichittosQueue.items as QueueItem[], read: readBichittosState, readControl: readBichittosControl },
  { brand: "Guitta Monatega Studio", items: studioQueue.items as QueueItem[], read: readStudioState, readControl: readStudioControl },
];

export async function runSocialPublishingWatchdog(now = new Date()) {
  const start = now.getTime() - WINDOW_MS;
  const failures: string[] = [];
  let checked = 0;

  for (const campaign of campaigns) {
    const expected = campaign.items.filter((item) => {
      const scheduled = new Date(item.scheduledAt).getTime();
      return scheduled <= now.getTime() && scheduled > start;
    });
    if (expected.length === 0) continue;
    const control = await campaign.readControl();
    if (!control.publishingEnabled) continue;
    for (const item of expected) {
      checked += 1;
      const state = await campaign.read(item.occurrence);
      const instagram = state?.instagram.status ?? "missing";
      const facebook = state?.facebook.status ?? "missing";
      if (instagram !== "published" || facebook !== "published") {
        failures.push(`${campaign.brand} ${item.occurrence} (${item.postId ?? item.slug ?? item.title ?? "post"}): Instagram=${instagram}, Facebook=${facebook}`);
      }
    }
  }

  if (failures.length) {
    await sendPublishingAlert({
      brand: "Monitor geral",
      summary: `${failures.length} publicação(ões) esperada(s) não foram concluídas.`,
      details: failures,
    });
    return { status: "alert-sent", checked, failures: failures.length };
  }
  return { status: "healthy", checked, failures: 0 };
}
