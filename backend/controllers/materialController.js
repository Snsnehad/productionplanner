const Material = require("../models/Material");
const asyncHandler = require("../utils/asyncHandler");

// GET /api/materials
const getMaterials = asyncHandler(async (req, res) => {
  const { search, category, isActive } = req.query;
  const filter = {};

  if (search) {
    filter.$or = [
      { materialName: { $regex: search, $options: "i" } },
      { materialCode: { $regex: search, $options: "i" } },
    ];
  }
  if (category) filter.category = category;
  if (isActive !== undefined) filter.isActive = isActive === "true";

  const materials = await Material.find(filter).sort({ materialName: 1 });
  res.json({ success: true, data: materials });
});

// GET /api/materials/:id
const getMaterialById = asyncHandler(async (req, res) => {
  const material = await Material.findById(req.params.id);
  if (!material) return res.status(404).json({ success: false, message: "Material not found" });
  res.json({ success: true, data: material });
});

// POST /api/materials
const createMaterial = asyncHandler(async (req, res) => {
  const material = await Material.create(req.body);
  res.status(201).json({ success: true, data: material });
});

// PUT /api/materials/:id
const updateMaterial = asyncHandler(async (req, res) => {
  const material = await Material.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!material) return res.status(404).json({ success: false, message: "Material not found" });
  res.json({ success: true, data: material });
});

// DELETE /api/materials/:id (soft delete)
const deleteMaterial = asyncHandler(async (req, res) => {
  const material = await Material.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!material) return res.status(404).json({ success: false, message: "Material not found" });
  res.json({ success: true, message: "Material deactivated", data: material });
});

module.exports = { getMaterials, getMaterialById, createMaterial, updateMaterial, deleteMaterial };
