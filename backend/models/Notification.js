const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    planId: { type: mongoose.Schema.Types.ObjectId, ref: "ProductionPlan", required: true },
    materialId: { type: mongoose.Schema.Types.ObjectId, ref: "Material", required: true },
    purchaserId: { type: mongoose.Schema.Types.ObjectId, ref: "Purchaser", required: true },
    status: {
      type: String,
      enum: ["pending", "acknowledged", "resolved"],
      default: "pending",
    },
    shortageQty: { type: Number, required: true, default: 0 },
    lastSentAt: { type: Date, default: null },
    nextReminderAt: { type: Date, default: null },
    reminderCount: { type: Number, default: 0 },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// One active notification per plan+material combination
notificationSchema.index({ planId: 1, materialId: 1 }, { unique: true });

module.exports = mongoose.model("Notification", notificationSchema);
