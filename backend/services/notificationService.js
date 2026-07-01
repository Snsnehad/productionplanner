const Notification = require("../models/Notification");
const MaterialPurchaser = require("../models/MaterialPurchaser");
const Purchaser = require("../models/Purchaser");
const PlanMaterial = require("../models/PlanMaterial");
const { sendShortageAlertEmail } = require("./emailService");

const REMINDER_INTERVAL_HOURS = Number(process.env.REMINDER_INTERVAL_HOURS) || 2;

// Finds the purchaser responsible for a given material, via materialPurchasers mapping
const getResponsiblePurchaser = async (materialId) => {
  const mapping = await MaterialPurchaser.findOne({ materialId }).populate("purchaserId");
  if (!mapping || !mapping.purchaserId) return null;
  return mapping.purchaserId;
};

// Creates (or reuses) a shortage notification for a plan+material.
// Sends an email only when the notification is newly created or being
// re-opened after resolution — NOT on every hourly shortage re-check.
// This keeps the reminder cadence owned entirely by reminderScheduler
// (every REMINDER_INTERVAL_HOURS), instead of shortageScheduler's hourly
// run overwriting nextReminderAt and re-sending mail every hour.
const createShortageNotification = async ({ plan, material, shortageQty, requiredQty, availableQty }) => {
  const purchaser = await getResponsiblePurchaser(material._id);

  if (!purchaser) {
    console.warn(`[notificationService] No purchaser mapped for material ${material.materialCode}. Notification not created.`);
    return null;
  }

  let notification = await Notification.findOne({ planId: plan._id, materialId: material._id });
  let isNewOrReopened = false;

  if (!notification) {
    notification = new Notification({
      planId: plan._id,
      materialId: material._id,
      purchaserId: purchaser._id,
      shortageQty,
      status: "pending",
      reminderCount: 0,
    });
    isNewOrReopened = true;
  } else if (notification.status === "resolved") {
    // Shortage reappeared after being resolved — treat as a fresh alert
    notification.status = "pending";
    notification.resolvedAt = null;
    notification.shortageQty = shortageQty;
    isNewOrReopened = true;
  } else if (notification.status === "acknowledged") {
    // Purchaser already acknowledged it; just keep the shortage figure current,
    // don't re-email or restart the reminder clock.
    notification.shortageQty = shortageQty;
    await notification.save();
    return notification;
  } else {
    // Already pending: sync the latest shortage qty but don't touch
    // reminderCount / nextReminderAt / send mail — reminderScheduler owns that.
    notification.shortageQty = shortageQty;
    await notification.save();
    return notification;
  }

  const nextReminderAt = new Date(Date.now() + REMINDER_INTERVAL_HOURS * 60 * 60 * 1000);
  notification.lastSentAt = new Date();
  notification.nextReminderAt = nextReminderAt;
  notification.reminderCount = (notification.reminderCount || 0) + 1;

  await notification.save();

  if (isNewOrReopened) {
    await sendShortageAlertEmail({
      purchaserName: purchaser.name,
      purchaserEmail: purchaser.email,
      plan,
      material,
      requiredQty,
      availableQty,
      shortageQty,
      isReminder: false,
      reminderCount: notification.reminderCount,
    });
  }

  return notification;
};

// Sends a reminder for an existing pending notification and reschedules the next one
const sendReminder = async (notification) => {
  const populated = await Notification.findById(notification._id)
    .populate("planId")
    .populate("materialId")
    .populate("purchaserId");

  if (!populated || populated.status !== "pending") return null;

  const { planId: plan, materialId: material, purchaserId: purchaser } = populated;

  // Pull current numbers so the reminder reflects the latest stock position, not stale data
  const planMaterial = await PlanMaterial.findOne({ planId: plan._id, materialId: material._id });
  const requiredQty = planMaterial ? planMaterial.requiredQty : undefined;
  const availableQty = material.currentStock - material.reservedStock;

  await sendShortageAlertEmail({
    purchaserName: purchaser.name,
    purchaserEmail: purchaser.email,
    plan,
    material,
    requiredQty,
    availableQty,
    shortageQty: populated.shortageQty,
    isReminder: true,
    reminderCount: populated.reminderCount + 1,
  });

  populated.reminderCount += 1;
  populated.lastSentAt = new Date();
  populated.nextReminderAt = new Date(Date.now() + REMINDER_INTERVAL_HOURS * 60 * 60 * 1000);
  await populated.save();

  return populated;
};

module.exports = { getResponsiblePurchaser, createShortageNotification, sendReminder };
