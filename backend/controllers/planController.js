const ProductionPlan = require("../models/ProductionPlan");
const PlanMaterial = require("../models/PlanMaterial");
const Material = require("../models/Material");
const asyncHandler = require("../utils/asyncHandler");
const generatePlanNumber = require("../utils/generatePlanNumber");
const { reserveOrShortage, releaseReservedStock } = require("../services/stockService");
const { createShortageNotification } = require("../services/notificationService");

// GET /api/plans
const getPlans = asyncHandler(async (req, res) => {
  const { department, status, search } = req.query;
  const filter = {};

  if (department) filter.department = department;
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { planNumber: { $regex: search, $options: "i" } },
      { planName: { $regex: search, $options: "i" } },
    ];
  }

  const plans = await ProductionPlan.find(filter)
    .populate("createdBy", "name email")
    .sort({ startDate: 1 });

  // Fetch materials for all matched plans in one query, then group by planId
  // (avoids N+1 queries when there are many plans)
  const planIds = plans.map((p) => p._id);
  const planMaterials = await PlanMaterial.find({ planId: { $in: planIds } }).populate(
    "materialId",
    "materialCode materialName unit currentStock reservedStock"
  );

  const materialsByPlanId = planMaterials.reduce((acc, pm) => {
    const key = pm.planId.toString();
    if (!acc[key]) acc[key] = [];
    acc[key].push(pm);
    return acc;
  }, {});

  const plansWithMaterials = plans.map((plan) => ({
    ...plan.toObject(),
    materials: materialsByPlanId[plan._id.toString()] || [],
  }));

  res.json({ success: true, data: plansWithMaterials });
});

// GET /api/plans/:id  (plan + its materials with shortage info)
const getPlanById = asyncHandler(async (req, res) => {
  const plan = await ProductionPlan.findById(req.params.id).populate("createdBy", "name email");
  if (!plan) return res.status(404).json({ success: false, message: "Plan not found" });

  const materials = await PlanMaterial.find({ planId: plan._id }).populate(
    "materialId",
    "materialCode materialName unit currentStock reservedStock"
  );

  res.json({ success: true, data: { plan, materials } });
});

// POST /api/plans
// Body: { planName, department, startDate, endDate, description, materials: [{ materialId, requiredQty }] }
const createPlan = asyncHandler(async (req, res) => {
  const { planName, department, startDate, endDate, description, materials } = req.body;

  if (!planName || !department || !startDate || !endDate) {
    return res.status(400).json({
      success: false,
      message: "planName, department, startDate and endDate are required",
    });
  }

  if (!Array.isArray(materials) || materials.length === 0) {
    return res.status(400).json({ success: false, message: "At least one material is required" });
  }

  if (new Date(endDate) < new Date(startDate)) {
    return res.status(400).json({ success: false, message: "endDate cannot be before startDate" });
  }

  const planNumber = await generatePlanNumber();

  const plan = await ProductionPlan.create({
    planNumber,
    planName,
    department,
    startDate,
    endDate,
    description,
    status: "approved", // stock is checked/reserved immediately on creation
    createdBy: req.user._id,
  });

  const results = [];

  for (const item of materials) {
    const { materialId, requiredQty } = item;

    if (!materialId || !requiredQty || requiredQty <= 0) {
      results.push({ materialId, error: "Invalid materialId or requiredQty, skipped" });
      continue;
    }

    const material = await Material.findById(materialId);
    if (!material) {
      results.push({ materialId, error: "Material not found, skipped" });
      continue;
    }

    const { sufficient, reservedQty, shortageQty } = await reserveOrShortage(materialId, requiredQty);

    const planMaterial = await PlanMaterial.create({
      planId: plan._id,
      materialId,
      requiredQty,
      reservedQty,
      shortageQty,
    });

    let notification = null;

    if (!sufficient) {
      const availableQty = material.currentStock - material.reservedStock; // pre-reservation snapshot
      notification = await createShortageNotification({
        plan,
        material,
        shortageQty,
        requiredQty,
        availableQty,
      });
    }

    results.push({
      materialId,
      materialName: material.materialName,
      requiredQty,
      reservedQty,
      shortageQty,
      sufficient,
      notificationCreated: Boolean(notification),
    });
  }

  res.status(201).json({ success: true, data: { plan, materials: results } });
});

// PUT /api/plans/:id/status  -> draft | approved | completed | cancelled
const updatePlanStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ["draft", "approved", "completed", "cancelled"];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: `status must be one of: ${validStatuses.join(", ")}` });
  }

  const plan = await ProductionPlan.findById(req.params.id);
  if (!plan) return res.status(404).json({ success: false, message: "Plan not found" });

  // Cancelling releases all reserved stock back to inventory
  if (status === "cancelled" && plan.status !== "cancelled") {
    const planMaterials = await PlanMaterial.find({ planId: plan._id });
    for (const pm of planMaterials) {
      await releaseReservedStock(pm.materialId, pm.reservedQty);
    }
  }

  plan.status = status;
  await plan.save();

  res.json({ success: true, data: plan });
});

module.exports = { getPlans, getPlanById, createPlan, updatePlanStatus };
