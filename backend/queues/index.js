const { Queue } = require("bullmq");
const { getRedisConnection } = require("../config/redis");

const connection = getRedisConnection();

// shortage-check: runs hourly — detects plan material shortages & fires initial alerts
const shortageQueue = new Queue("shortage-check", {
  connection,
  defaultJobOptions: {
    removeOnComplete: 50, // keep last 50 completed jobs for debugging
    removeOnFail: 100,
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
  },
});

// reminder-check: runs every 2 hours — resends emails for unresolved notifications
const reminderQueue = new Queue("reminder-check", {
  connection,
  defaultJobOptions: {
    removeOnComplete: 50,
    removeOnFail: 100,
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
  },
});

module.exports = { shortageQueue, reminderQueue, connection };
