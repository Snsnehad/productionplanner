const express = require("express");
const router = express.Router();
const {
  getPurchasers,
  getPurchaserById,
  createPurchaser,
  updatePurchaser,
  deletePurchaser,
} = require("../controllers/purchaserController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

router.get("/", getPurchasers);
router.get("/:id", getPurchaserById);
router.post("/", authorize("admin"), createPurchaser);
router.put("/:id", authorize("admin"), updatePurchaser);
router.delete("/:id", authorize("admin"), deletePurchaser);

module.exports = router;
