require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

// Route imports
const authRoutes = require("./routes/authRoutes");
const materialRoutes = require("./routes/materialRoutes");
const purchaserRoutes = require("./routes/purchaserRoutes");
const materialPurchaserRoutes = require("./routes/materialPurchaserRoutes");
const planRoutes = require("./routes/planRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

// BullMQ — schedulers register repeatable jobs, workers process them
const { startShortageScheduler } = require("./schedulers/shortageScheduler");
const { startReminderScheduler } = require("./schedulers/reminderScheduler");
const { startShortageWorker, stopShortageWorker } = require("./workers/shortageWorker");
const { startReminderWorker, stopReminderWorker } = require("./workers/reminderWorker");

const app = express();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || "*", credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Routes
app.use("/api/seed", require("./routes/seedRoute"));
app.use("/api/auth", authRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/purchasers", purchaserRoutes);
app.use("/api/material-purchasers", materialPurchaserRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/dashboard", dashboardRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();

  app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);

    // Start BullMQ workers (listen for jobs)
    startShortageWorker();
    startReminderWorker();

    // Register repeatable jobs in Redis (idempotent — safe to call on every restart)
    await startShortageScheduler();
    await startReminderScheduler();
  });
};

// Graceful shutdown — close workers before process exits
const shutdown = async () => {
  console.log("Shutting down gracefully...");
  await stopShortageWorker();
  await stopReminderWorker();
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

start();

module.exports = app;
