const { shortageQueue } = require("../queues");

// Registers a repeatable "shortage-check" job that BullMQ automatically
// re-enqueues on the given cron pattern — every hour at minute 0.
// Unlike node-cron, this job definition lives in Redis, so it survives
// server restarts and won't create duplicates if called more than once
// (BullMQ deduplicates by jobId).
const startShortageScheduler = async () => {
  await shortageQueue.add(
    "shortage-check-recurring",
    {}, // no payload needed — worker reads from DB
    {
      repeat: { pattern: "0 * * * *" }, // every hour
      jobId: "shortage-check-recurring", // fixed ID prevents duplicates on restart
    }
  );

  console.log("[shortageScheduler] Repeatable job registered — runs every hour");
};

module.exports = { startShortageScheduler };
