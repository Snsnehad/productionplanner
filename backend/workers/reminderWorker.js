const { Worker } = require("bullmq");
const { getRedisConnection } = require("../config/redis");
const Notification = require("../models/Notification");
const { sendReminder } = require("../services/notificationService");

// Exact same logic as the old reminderScheduler — moved into a BullMQ worker.
const processReminderCheck = async (job) => {
  const now = new Date();

  const pending = await Notification.find({
    status: "pending",
    $or: [{ nextReminderAt: { $lte: now } }, { nextReminderAt: null }],
  });

  let sent = 0;

  for (const notification of pending) {
    try {
      await sendReminder(notification);
      sent++;
    } catch (err) {
      console.error(
        `[reminderWorker] Failed to send reminder for notification ${notification._id}:`,
        err.message
      );
      // Don't rethrow — one failed email shouldn't fail the whole job
    }
  }

  console.log(`[reminderWorker] job#${job.id} — sent ${sent}/${pending.length} reminder(s)`);

  return { total: pending.length, sent };
};

let reminderWorker = null;

const startReminderWorker = () => {
  reminderWorker = new Worker("reminder-check", processReminderCheck, {
    connection: getRedisConnection(),
    concurrency: 1,
  });

  reminderWorker.on("completed", (job, result) => {
    console.log(`[reminderWorker] completed job#${job.id}:`, result);
  });

  reminderWorker.on("failed", (job, err) => {
    console.error(`[reminderWorker] failed job#${job?.id}:`, err.message);
  });

  console.log("[reminderWorker] Worker started — listening for reminder-check jobs");
  return reminderWorker;
};

const stopReminderWorker = async () => {
  if (reminderWorker) await reminderWorker.close();
};

module.exports = { startReminderWorker, stopReminderWorker };
