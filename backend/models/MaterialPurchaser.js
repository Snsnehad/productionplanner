const mongoose = require("mongoose");

const materialPurchaserSchema = new mongoose.Schema(
  {
    materialId: { type: mongoose.Schema.Types.ObjectId, ref: "Material", required: true },
    purchaserId: { type: mongoose.Schema.Types.ObjectId, ref: "Purchaser", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// A material should map to exactly one purchaser at a time
materialPurchaserSchema.index({ materialId: 1 }, { unique: true });

module.exports = mongoose.model("MaterialPurchaser", materialPurchaserSchema);
