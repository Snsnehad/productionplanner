const { reminderQueue } = require("../queues");

// Registers a repeatable "reminder-check" job — every 2 hours at minute 0.
// BullMQ keeps this in Redis, so it persists across restarts and won't
// duplicate on multiple server startup calls.
const startReminderScheduler = async () => {
  await reminderQueue.add(
    "reminder-check-recurring",
    {},
    {
      repeat: { pattern: "0 */2 * * *" }, // every 2 hours
      jobId: "reminder-check-recurring",
    }
  );

  console.log("[reminderScheduler] Repeatable job registered — runs every 2 hours");
};

module.exports = { startReminderScheduler };
