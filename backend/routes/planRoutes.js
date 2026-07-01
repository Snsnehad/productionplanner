const express = require("express");
const router = express.Router();
const {
  getPlans,
  getPlanById,
  createPlan,
  updatePlanStatus,
} = require("../controllers/planController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

router.get("/", getPlans);
router.get("/:id", getPlanById);
router.post("/", authorize("admin", "planner"), createPlan);
router.put("/:id/status", authorize("admin", "planner"), updatePlanStatus);

module.exports = router;
