import { KAMMARA } from "@/lib/safe-social/brands";
import { manualRouteGET } from "@/lib/safe-social/cron-handlers";

export const runtime = "nodejs";
// The safe publisher performs at most one external request and never waits or polls.
export const maxDuration = 30;

export const GET = manualRouteGET(KAMMARA);
