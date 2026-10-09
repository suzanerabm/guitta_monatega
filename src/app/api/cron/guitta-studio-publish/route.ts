import { timingSafeEqual } from "node:crypto";
import { runGuittaStudioPublisher } from "@/lib/guitta-studio-social/run";
import { verifyStateAccess } from "@/lib/guitta-studio-social/state";

export const runtime = "nodejs";
export const maxDuration = 300;

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!secret || !supplied) return false;
  const left = Buffer.from(secret);
  const right = Buffer.from(supplied);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function GET(request: Request) {
  if (!authorized(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const dryRun = new URL(request.url).searchParams.get("dryRun") === "1";
    if (dryRun) await verifyStateAccess();
    return Response.json(await runGuittaStudioPublisher(new Date(), dryRun));
  } catch (error) {
    console.error("Guitta Studio publisher failed", error);
    return Response.json({ error: error instanceof Error ? error.message : "Unknown publication error" }, { status: 500 });
  }
}
