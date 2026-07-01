const express = require("express");
const router = express.Router();
const {
  getNotifications,
  getNotificationById,
  acknowledgeNotification,
  resolveNotification,
} = require("../controllers/notificationController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

router.get("/", getNotifications);
router.get("/:id", getNotificationById);
router.post("/:id/acknowledge", authorize("admin", "purchaser"), acknowledgeNotification);
router.post("/:id/resolve", authorize("admin", "purchaser"), resolveNotification);

module.exports = router;
