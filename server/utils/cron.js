import cron from "cron";
import https from "https";

// Configuration for free tier optimization
const ENABLE_KEEP_ALIVE = process.env.ENABLE_KEEP_ALIVE === "true";
const KEEP_ALIVE_START_HOUR = parseInt(process.env.KEEP_ALIVE_START_HOUR || "9"); // 9 AM
const KEEP_ALIVE_END_HOUR = parseInt(process.env.KEEP_ALIVE_END_HOUR || "21"); // 9 PM

/**
 * Cron job to keep server alive during specified hours
 * For Render free tier: Set ENABLE_KEEP_ALIVE=false to disable and save hours
 * Or configure KEEP_ALIVE_START_HOUR and KEEP_ALIVE_END_HOUR to limit active hours
 */
const job = new cron.CronJob("*/14 * * * *", function () {
    // Skip if keep-alive is disabled
    if (!ENABLE_KEEP_ALIVE) {
        console.log("Keep-alive is disabled via environment variable");
        return;
    }

    // Check if current time is within active hours (IST timezone)
    const now = new Date();
    const currentHour = now.getHours();

    if (currentHour < KEEP_ALIVE_START_HOUR || currentHour >= KEEP_ALIVE_END_HOUR) {
        console.log(`Keep-alive skipped - outside active hours (${KEEP_ALIVE_START_HOUR}:00 - ${KEEP_ALIVE_END_HOUR}:00)`);
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
                console.log(`✓ Keep-alive ping successful at ${now.toLocaleTimeString()}`);
            } else {
                console.log(`✗ Keep-alive ping failed with status ${res.statusCode}`);
            }
        })
        .on("error", (e) => {
            console.error("Error while sending keep-alive request:", e.message);
        });
});

export default job;