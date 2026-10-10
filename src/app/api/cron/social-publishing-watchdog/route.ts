import { timingSafeEqual } from "node:crypto";
import { reportPublishingFailure, sendPublishingAlert } from "@/lib/social-publishing-alerts";
import { runSocialPublishingWatchdog } from "@/lib/social-publishing-watchdog";

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
    if (new URL(request.url).searchParams.get("testAlert") === "1") {
      await sendPublishingAlert({
        brand: "Monitor geral",
        summary: "Teste concluído. Os alertas de Kammara, Bichittos e Guitta Monatega Studio estão ativos.",
      });
      return Response.json({ status: "test-alert-sent" });
    }
    return Response.json(await runSocialPublishingWatchdog(new Date()));
  } catch (error) {
    console.error("Social publishing watchdog failed", error);
    await reportPublishingFailure({ brand: "Monitor geral", summary: "O verificador diário falhou.", error });
    return Response.json({ error: error instanceof Error ? error.message : "Unknown watchdog error" }, { status: 500 });
  }
}
