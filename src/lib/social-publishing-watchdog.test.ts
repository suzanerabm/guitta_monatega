import { describe, expect, it } from "vitest";
import { runSocialPublishingWatchdog } from "./social-publishing-watchdog";

describe("social publishing watchdog", () => {
  it("stays healthy before the first scheduled publication", async () => {
    await expect(runSocialPublishingWatchdog(new Date("2026-10-10T16:00:00Z"))).resolves.toEqual({
      status: "healthy",
      checked: 0,
      failures: 0,
    });
  });
});
