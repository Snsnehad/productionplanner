const mongoose = require("mongoose");

const productionPlanSchema = new mongoose.Schema(
  {
    planNumber: { type: String, required: true, unique: true, trim: true },
    planName: { type: String, required: true, trim: true },
    department: {
      type: String,
      required: true,
      enum: ["Winding", "Core", "CCA", "Tanking", "Testing"],
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    description: { type: String, trim: true },
    status: {
      type: String,
      enum: ["draft", "approved", "completed", "cancelled"],
      default: "draft",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProductionPlan", productionPlanSchema);
