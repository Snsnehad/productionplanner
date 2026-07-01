const ProductionPlan = require("../models/ProductionPlan");
const PlanMaterial = require("../models/PlanMaterial");
const Notification = require("../models/Notification");

// GET /api/dashboard/summary
const getSummary = async (req, res, next) => {
  try {
    const now = new Date();
    const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

    const [upcomingPlans, materialShortages, pendingNotifications, resolvedNotifications] = await Promise.all([
      ProductionPlan.countDocuments({ startDate: { $gte: now, $lte: twoDaysFromNow }, status: { $ne: "cancelled" } }),
      PlanMaterial.countDocuments({ shortageQty: { $gt: 0 } }),
      Notification.countDocuments({ status: "pending" }),
      Notification.countDocuments({ status: "resolved" }),
    ]);

    res.json({
      success: true,
      data: { upcomingPlans, materialShortages, pendingNotifications, resolvedNotifications },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/dashboard/upcoming-plans
const getUpcomingPlans = async (req, res, next) => {
  try {
    const plans = await ProductionPlan.find({ status: { $in: ["approved", "draft"] } })
      .sort({ startDate: 1 })
      .limit(20);
    res.json({ success: true, data: plans });
  } catch (err) {
    next(err);
  }
};

// GET /api/dashboard/shortages
const getShortages = async (req, res, next) => {
  try {
    const shortages = await PlanMaterial.find({ shortageQty: { $gt: 0 } })
      .populate("planId", "planNumber department status")
      .populate("materialId", "materialCode materialName unit currentStock reservedStock")
      .sort({ createdAt: -1 });

    // Attach purchaser + notification status for each shortage row
    const MaterialPurchaser = require("../models/MaterialPurchaser");
    const Notification = require("../models/Notification");

    const enriched = await Promise.all(
      shortages.map(async (row) => {
        const mapping = await MaterialPurchaser.findOne({ materialId: row.materialId._id }).populate("purchaserId", "name email");
        const notification = await Notification.findOne({ planId: row.planId._id, materialId: row.materialId._id });

        return {
          ...row.toObject(),
          purchaser: mapping ? mapping.purchaserId : null,
          notificationId: notification ? notification._id : null,
          notificationStatus: notification ? notification.status : null,
        };
      })
    );

    res.json({ success: true, data: enriched });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSummary, getUpcomingPlans, getShortages };
