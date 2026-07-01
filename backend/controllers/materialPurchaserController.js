const MaterialPurchaser = require("../models/MaterialPurchaser");
const asyncHandler = require("../utils/asyncHandler");

// GET /api/material-purchasers
const getMappings = asyncHandler(async (req, res) => {
  const mappings = await MaterialPurchaser.find()
    .populate("materialId", "materialCode materialName unit")
    .populate("purchaserId", "name email designation")
    .sort({ createdAt: -1 });

  res.json({ success: true, data: mappings });
});

// POST /api/material-purchasers
// Upserts: each material maps to exactly one purchaser, so re-mapping replaces the old purchaser.
const createMapping = asyncHandler(async (req, res) => {
  const { materialId, purchaserId } = req.body;

  if (!materialId || !purchaserId) {
    return res.status(400).json({ success: false, message: "materialId and purchaserId are required" });
  }

  const mapping = await MaterialPurchaser.findOneAndUpdate(
    { materialId },
    { materialId, purchaserId },
    { new: true, upsert: true, runValidators: true }
  )
    .populate("materialId", "materialCode materialName unit")
    .populate("purchaserId", "name email designation");

  res.status(201).json({ success: true, data: mapping });
});

// DELETE /api/material-purchasers/:id
const deleteMapping = asyncHandler(async (req, res) => {
  const mapping = await MaterialPurchaser.findByIdAndDelete(req.params.id);
  if (!mapping) return res.status(404).json({ success: false, message: "Mapping not found" });
  res.json({ success: true, message: "Mapping removed" });
});

module.exports = { getMappings, createMapping, deleteMapping };
