import { timingSafeEqual } from "node:crypto";
import { runBichittosPublisher } from "@/lib/bichittos-social/run";
import { PublicationNeedsReviewError, verifyStateAccess } from "@/lib/bichittos-social/state";
import { reportPublishingFailure } from "@/lib/social-publishing-alerts";

export const runtime = "nodejs";
export const maxDuration = 300;
const publishingPaused = true;

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!secret || !supplied) return false;
  const left = Buffer.from(secret);
  const right = Buffer.from(supplied);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function GET(request: Request) {
  if (publishingPaused) {
    return Response.json(
      { paused: true, message: "Bichittos publishing is paused pending a Meta API safety review." },
      { status: 503 },
    );
  }
  if (!authorized(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const url = new URL(request.url);
    const dryRun = url.searchParams.get("dryRun") === "1";
    if (dryRun) await verifyStateAccess();
    return Response.json(await runBichittosPublisher(new Date(), dryRun));
  } catch (error) {
    console.error("Bichittos publisher failed", error);
    if (error instanceof PublicationNeedsReviewError) {
      return Response.json({ error: error.message, status: "needs-review" }, { status: 409 });
    }
    await reportPublishingFailure({ brand: "Bichittos", summary: "O publicador encontrou uma falha.", error });
    return Response.json({ error: error instanceof Error ? error.message : "Unknown publication error" }, { status: 500 });
  }
}
