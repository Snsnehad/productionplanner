const mongoose = require("mongoose");

const planMaterialSchema = new mongoose.Schema(
  {
    planId: { type: mongoose.Schema.Types.ObjectId, ref: "ProductionPlan", required: true },
    materialId: { type: mongoose.Schema.Types.ObjectId, ref: "Material", required: true },
    requiredQty: { type: Number, required: true, min: 0 },
    reservedQty: { type: Number, required: true, default: 0, min: 0 },
    shortageQty: { type: Number, required: true, default: 0, min: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

planMaterialSchema.index({ planId: 1, materialId: 1 }, { unique: true });

module.exports = mongoose.model("PlanMaterial", planMaterialSchema);
