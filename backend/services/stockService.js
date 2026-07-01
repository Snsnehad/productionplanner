const Material = require("../models/Material");

// Available stock = currentStock - reservedStock
const getAvailableStock = (material) => material.currentStock - material.reservedStock;

// Attempts to reserve qty of a material.
// Returns { sufficient, reservedQty, shortageQty }
const reserveOrShortage = async (materialId, requiredQty) => {
  const material = await Material.findById(materialId);
  if (!material) {
    throw Object.assign(new Error("Material not found"), { statusCode: 404 });
  }

  const available = getAvailableStock(material);

  if (available >= requiredQty) {
    material.reservedStock += requiredQty;
    await material.save();
    return { material, sufficient: true, reservedQty: requiredQty, shortageQty: 0, availableAtCheck: available };
  }

  // Insufficient: reserve whatever is available, the rest is shortage
  const reservedQty = Math.max(available, 0);
  const shortageQty = requiredQty - reservedQty;

  if (reservedQty > 0) {
    material.reservedStock += reservedQty;
    await material.save();
  }

  return { material, sufficient: false, reservedQty, shortageQty, availableAtCheck: available };
};

// Releases previously reserved stock (used when a plan is cancelled, for example)
const releaseReservedStock = async (materialId, qty) => {
  if (!qty || qty <= 0) return;
  const material = await Material.findById(materialId);
  if (!material) return;
  material.reservedStock = Math.max(0, material.reservedStock - qty);
  await material.save();
};

module.exports = { getAvailableStock, reserveOrShortage, releaseReservedStock };
