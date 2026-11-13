import { timingSafeEqual } from "node:crypto";
import { runGuittaStudioScheduledPublisher } from "@/lib/guitta-studio-social/scheduled-run";
import { pauseStudioSchedule } from "@/lib/guitta-studio-social/state";
import { reportPublishingFailure } from "@/lib/social-publishing-alerts";

export const runtime = "nodejs";
export const maxDuration = 30;

function publishingCronEnabled(): boolean {
  return process.env.GUITTA_STUDIO_META_CRON_ENABLED === "true";
}

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!secret || !supplied) return false;
  const left = Buffer.from(secret);
  const right = Buffer.from(supplied);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function GET(request: Request) {
  if (!publishingCronEnabled()) {
    return Response.json(
      { paused: true, message: "Guitta Studio scheduled publishing is disabled." },
      { status: 503 },
    );
  }
  if (!authorized(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const result = await runGuittaStudioScheduledPublisher(new Date());
    console.info("Guitta Studio scheduled publisher result", result);
    if (result.status === "schedule-conflict" || result.status === "needs-review") {
      await reportPublishingFailure({
        brand: "Guitta Monatega Studio",
        summary: "O cron seguro do Studio foi pausado para revisão.",
        error: JSON.stringify(result),
      });
    }
    return Response.json(result);
  } catch (error) {
    console.error("Guitta Studio scheduled publisher failed", error);
    try {
      await pauseStudioSchedule(
        `Unexpected scheduled publisher failure: ${error instanceof Error ? error.message : String(error)}`,
      );
    } catch (pauseError) {
      console.error("Guitta Studio schedule could not be paused", pauseError);
    }
    await reportPublishingFailure({
      brand: "Guitta Monatega Studio",
      summary: "O cron seguro do Studio encontrou uma falha e foi pausado.",
      error,
    });
    return Response.json({ error: "Scheduled publishing stopped for human review." }, { status: 500 });
  }
}
