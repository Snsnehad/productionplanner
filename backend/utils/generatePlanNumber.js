const ProductionPlan = require("../models/ProductionPlan");

// Generates a sequential plan number like PLAN-001, PLAN-002 ...
const generatePlanNumber = async () => {
  const count = await ProductionPlan.countDocuments();
  const next = count + 1;
  return `PLAN-${String(next).padStart(3, "0")}`;
};

module.exports = generatePlanNumber;
