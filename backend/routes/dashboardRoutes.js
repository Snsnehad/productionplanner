const express = require("express");
const router = express.Router();
const { getSummary, getUpcomingPlans, getShortages } = require("../controllers/dashboardController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.get("/summary", getSummary);
router.get("/upcoming-plans", getUpcomingPlans);
router.get("/shortages", getShortages);

module.exports = router;
