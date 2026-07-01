const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema(
  {
    materialCode: { type: String, required: true, unique: true, trim: true, uppercase: true },
    materialName: { type: String, required: true, trim: true },
    category: { type: String, trim: true, default: "General" },
    unit: { type: String, required: true, trim: true }, // Kg, Nos, Mtr, Ltr etc.
    currentStock: { type: Number, required: true, default: 0, min: 0 },
    reservedStock: { type: Number, required: true, default: 0, min: 0 },
    minimumStock: { type: Number, required: true, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Virtual: available stock = current - reserved
materialSchema.virtual("availableStock").get(function () {
  return this.currentStock - this.reservedStock;
});

materialSchema.set("toJSON", { virtuals: true });
materialSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Material", materialSchema);
