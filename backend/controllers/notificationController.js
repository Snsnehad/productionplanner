const Notification = require("../models/Notification");
const asyncHandler = require("../utils/asyncHandler");

// GET /api/notifications
const getNotifications = asyncHandler(async (req, res) => {
  const { status, purchaserId } = req.query;
  const filter = {};

  if (status) filter.status = status;
  if (purchaserId) filter.purchaserId = purchaserId;

  const notifications = await Notification.find(filter)
    .populate("planId", "planNumber planName department startDate")
    .populate("materialId", "materialCode materialName unit")
    .populate("purchaserId", "name email designation")
    .sort({ createdAt: -1 });

  res.json({ success: true, data: notifications });
});

// GET /api/notifications/:id
const getNotificationById = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id)
    .populate("planId")
    .populate("materialId")
    .populate("purchaserId");

  if (!notification) return res.status(404).json({ success: false, message: "Notification not found" });
  res.json({ success: true, data: notification });
});

// POST /api/notifications/:id/acknowledge
const acknowledgeNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) return res.status(404).json({ success: false, message: "Notification not found" });

  if (notification.status === "resolved") {
    return res.status(400).json({ success: false, message: "Notification is already resolved" });
  }

  notification.status = "acknowledged";
  // Acknowledging stops reminders until/unless it's explicitly reopened
  notification.nextReminderAt = null;
  await notification.save();

  res.json({ success: true, message: "Notification acknowledged, reminders paused", data: notification });
});

// POST /api/notifications/:id/resolve
const resolveNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) return res.status(404).json({ success: false, message: "Notification not found" });

  notification.status = "resolved";
  notification.resolvedAt = new Date();
  notification.nextReminderAt = null;
  await notification.save();

  res.json({ success: true, message: "Notification resolved, no further reminders will be sent", data: notification });
});

module.exports = { getNotifications, getNotificationById, acknowledgeNotification, resolveNotification };
