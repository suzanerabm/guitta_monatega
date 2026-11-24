import { timingSafeEqual } from "node:crypto";
import { reportPublishingFailure } from "@/lib/social-publishing-alerts";
import type { SafeBrand } from "./brands";
import { runManualPublisher } from "./run";
import { runScheduledPublisher } from "./scheduled-run";
import { storeFor } from "./state";

// Route handler bodies shared by every brand on the safe publisher. Each route file keeps its own
// literal `runtime` and `maxDuration` exports (Next.js reads those statically) and only binds
// the handler to a brand: `export const GET = scheduledCronGET(GUITTA_STUDIO)`.

function bearerMatches(request: Request, secret: string | undefined): boolean {
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!secret || !supplied) return false;
  const left = Buffer.from(secret);
  const right = Buffer.from(supplied);
  return left.length === right.length && timingSafeEqual(left, right);
}

// Vercel cron entry point: requires `${envPrefix}_META_CRON_ENABLED=true` and CRON_SECRET.
export function scheduledCronGET(brand: SafeBrand): (request: Request) => Promise<Response> {
  const { copy } = brand;
  return async function GET(request: Request) {
    if (process.env[`${brand.envPrefix}_META_CRON_ENABLED`] !== "true") {
      return Response.json(
        { paused: true, message: copy.cronDisabledMessage },
        { status: 503 },
      );
    }
    if (!bearerMatches(request, process.env.CRON_SECRET)) return Response.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const result = await runScheduledPublisher(brand, new Date());
      console.info(`${copy.logName} scheduled publisher result`, result);
      if (result.status === "schedule-conflict" || result.status === "needs-review") {
        await reportPublishingFailure({
          brand: brand.alertBrand,
          summary: copy.cronReviewAlertSummary,
          error: JSON.stringify(result),
        });
      }
      return Response.json(result);
    } catch (error) {
      console.error(`${copy.logName} scheduled publisher failed`, error);
      try {
        await storeFor(brand).pauseSchedule(
          `Unexpected scheduled publisher failure: ${error instanceof Error ? error.message : String(error)}`,
        );
      } catch (pauseError) {
        console.error(`${copy.logName} schedule could not be paused`, pauseError);
      }
      await reportPublishingFailure({
        brand: brand.alertBrand,
        summary: copy.cronFailureAlertSummary,
        error,
      });
      return Response.json({ error: "Scheduled publishing stopped for human review." }, { status: 500 });
    }
  };
}

// Supervised manual entry point: requires `${envPrefix}_META_ROUTE_ENABLED=true` and
// `${envPrefix}_META_MANUAL_SECRET`. The safe publisher performs at most one external request
// and never waits or polls.
export function manualRouteGET(brand: SafeBrand): (request: Request) => Promise<Response> {
  const { copy } = brand;
  return async function GET(request: Request) {
    if (process.env[`${brand.envPrefix}_META_ROUTE_ENABLED`] !== "true") {
      return Response.json(
        { paused: true, message: copy.manualPausedMessage },
        { status: 503 },
      );
    }
    if (!bearerMatches(request, process.env[`${brand.envPrefix}_META_MANUAL_SECRET`])) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
      const dryRun = new URL(request.url).searchParams.get("dryRun") === "1";
      if (dryRun) await storeFor(brand).verifyStateAccess();
      const result = await runManualPublisher(brand, new Date(), dryRun);
      console.info(`${copy.logName} publisher result`, result);
      return Response.json(result);
    } catch (error) {
      console.error(`${copy.logName} publisher failed`, error);
      await reportPublishingFailure({ brand: brand.alertBrand, summary: copy.manualFailureAlertSummary, error });
      return Response.json({ error: error instanceof Error ? error.message : "Unknown publication error" }, { status: 500 });
    }
  };
}
