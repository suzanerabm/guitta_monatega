import { timingSafeEqual } from "node:crypto";
import { runKammaraPublisher } from "@/lib/kammara-social/run";
import { verifyStateAccess } from "@/lib/kammara-social/state";
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
      { paused: true, message: "Kammara publishing is paused during account recovery." },
      { status: 503 },
    );
  }
  if (!authorized(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const url = new URL(request.url);
    if (url.searchParams.get("dryRun") === "1") await verifyStateAccess();
    const result = await runKammaraPublisher(new Date(), url.searchParams.get("dryRun") === "1");
    return Response.json(result);
  } catch (error) {
    console.error("Kammara publisher failed", error);
    await reportPublishingFailure({ brand: "Kammara", summary: "O publicador encontrou uma falha.", error });
    return Response.json({ error: error instanceof Error ? error.message : "Unknown publication error" }, { status: 500 });
  }
}
