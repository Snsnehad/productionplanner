const express = require("express");
const router = express.Router();
const {
  getMaterials,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial,
} = require("../controllers/materialController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

router.get("/", getMaterials);
router.get("/:id", getMaterialById);
router.post("/", authorize("admin", "planner"), createMaterial);
router.put("/:id", authorize("admin", "planner"), updateMaterial);
router.delete("/:id", authorize("admin"), deleteMaterial);

module.exports = router;
