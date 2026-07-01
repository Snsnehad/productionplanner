const Purchaser = require("../models/Purchaser");
const asyncHandler = require("../utils/asyncHandler");

// GET /api/purchasers
const getPurchasers = asyncHandler(async (req, res) => {
  const { search, isActive } = req.query;
  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }
  if (isActive !== undefined) filter.isActive = isActive === "true";

  const purchasers = await Purchaser.find(filter).sort({ name: 1 });
  res.json({ success: true, data: purchasers });
});

// GET /api/purchasers/:id
const getPurchaserById = asyncHandler(async (req, res) => {
  const purchaser = await Purchaser.findById(req.params.id);
  if (!purchaser) return res.status(404).json({ success: false, message: "Purchaser not found" });
  res.json({ success: true, data: purchaser });
});

// POST /api/purchasers
const createPurchaser = asyncHandler(async (req, res) => {
  const purchaser = await Purchaser.create(req.body);
  res.status(201).json({ success: true, data: purchaser });
});

// PUT /api/purchasers/:id
const updatePurchaser = asyncHandler(async (req, res) => {
  const purchaser = await Purchaser.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!purchaser) return res.status(404).json({ success: false, message: "Purchaser not found" });
  res.json({ success: true, data: purchaser });
});

// DELETE /api/purchasers/:id (soft delete)
const deletePurchaser = asyncHandler(async (req, res) => {
  const purchaser = await Purchaser.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!purchaser) return res.status(404).json({ success: false, message: "Purchaser not found" });
  res.json({ success: true, message: "Purchaser deactivated", data: purchaser });
});

module.exports = { getPurchasers, getPurchaserById, createPurchaser, updatePurchaser, deletePurchaser };
