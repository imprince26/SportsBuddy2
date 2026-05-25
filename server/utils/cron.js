import cron from "cron";
import https from "https";
import { processDueScheduledAdminNotifications } from "../services/adminNotificationService.js";

// Configuration for free tier optimization
const ENABLE_KEEP_ALIVE = process.env.ENABLE_KEEP_ALIVE === "true";
const KEEP_ALIVE_START_HOUR = parseInt(process.env.KEEP_ALIVE_START_HOUR || "8", 10); // 8 AM
const KEEP_ALIVE_END_HOUR = parseInt(process.env.KEEP_ALIVE_END_HOUR || "20", 10); // 8 PM
const KEEP_ALIVE_TIMEZONE = process.env.KEEP_ALIVE_TIMEZONE || "Asia/Kolkata";

const getCurrentHourInTimeZone = (timeZone) => {
    const hour = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        hour12: false,
        timeZone,
    }).format(new Date());

    return Number.parseInt(hour, 10);
};

const keepAliveJob = new cron.CronJob("*/14 * * * *", function () {
    // Skip if keep-alive is disabled
    if (!ENABLE_KEEP_ALIVE) {
        console.log("Keep-alive is disabled via environment variable");
        return;
    }

    // Check if current time is within active hours in the configured timezone.
    const now = new Date();
    const currentHour = getCurrentHourInTimeZone(KEEP_ALIVE_TIMEZONE);

    if (currentHour < KEEP_ALIVE_START_HOUR || currentHour >= KEEP_ALIVE_END_HOUR) {
        console.log(`Keep-alive skipped - outside active hours (${KEEP_ALIVE_START_HOUR}:00 - ${KEEP_ALIVE_END_HOUR}:00 ${KEEP_ALIVE_TIMEZONE})`);
        return;
    }

    // Only ping if API_URL is configured
    if (!process.env.API_URL) {
        console.warn("API_URL not configured - skipping keep-alive ping");
        return;
    }

    // Send keep-alive ping
    https
        .get(process.env.API_URL, (res) => {
            if (res.statusCode === 200) {
                console.log(`✓ Keep-alive ping successful at ${now.toLocaleTimeString("en-IN", { timeZone: KEEP_ALIVE_TIMEZONE })}`);
            } else {
                console.log(`✗ Keep-alive ping failed with status ${res.statusCode}`);
            }
        })
        .on("error", (e) => {
            console.error("Error while sending keep-alive request:", e.message);
        });
});

const notificationDispatchJob = new cron.CronJob("*/1 * * * *", async function () {
    try {
        const result = await processDueScheduledAdminNotifications(25);
        if (result.due > 0) {
            console.log(
                `Scheduled notifications processed: ${result.processed}, failed: ${result.failed}`
            );
        }
    } catch (error) {
        console.error("Failed to process scheduled notifications:", error.message);
    }
});

const job = {
    start() {
        keepAliveJob.start();
        notificationDispatchJob.start();
    },
    stop() {
        keepAliveJob.stop();
        notificationDispatchJob.stop();
    }
};

export default job;
