const express = require("express");
const router = express.Router();
const {
  getMappings,
  createMapping,
  deleteMapping,
} = require("../controllers/materialPurchaserController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

router.get("/", getMappings);
router.post("/", authorize("admin"), createMapping);
router.delete("/:id", authorize("admin"), deleteMapping);

module.exports = router;
