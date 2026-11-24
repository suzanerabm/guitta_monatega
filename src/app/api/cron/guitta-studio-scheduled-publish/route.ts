import { GUITTA_STUDIO } from "@/lib/safe-social/brands";
import { scheduledCronGET } from "@/lib/safe-social/cron-handlers";

export const runtime = "nodejs";
export const maxDuration = 30;

export const GET = scheduledCronGET(GUITTA_STUDIO);
