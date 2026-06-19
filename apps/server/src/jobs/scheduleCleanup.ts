import cron from "node-cron";
import { cleanupExpiredReservations } from "./cleanupExpired.js";

export function startCleanupCron(): void {
  cron.schedule("* * * * *", () => {
    cleanupExpiredReservations().catch((error) => {
      console.error("Cleanup cron failed:", error);
    });
  });

  console.log("Reservation cleanup cron scheduled (every minute)");
}
