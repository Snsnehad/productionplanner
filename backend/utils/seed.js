// Seeds the database with a starter admin user, sample materials, purchasers,
// and a mapping so the app is testable right after setup.
// Run with: npm run seed
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const Material = require("../models/Material");
const Purchaser = require("../models/Purchaser");
const MaterialPurchaser = require("../models/MaterialPurchaser");

const run = async () => {
  await connectDB();

  // Users
  const usersToSeed = [
    { name: "Admin User", email: "admin@transformer.com", password: "Admin@123", role: "admin" },
    { name: "Planner User", email: "planner@transformer.com", password: "Planner@123", role: "planner" },
    { name: "Rajesh Kumar", email: "rajesh@transformer.com", password: "Purchase@123", role: "purchaser" },
  ];

  for (const u of usersToSeed) {
    const exists = await User.findOne({ email: u.email });
    if (!exists) await User.create(u);
  }
  console.log("Users seeded");

  // Materials
  const materialsToSeed = [
    { materialCode: "CU-001", materialName: "Copper", category: "Conductor", unit: "Kg", currentStock: 1000, reservedStock: 300, minimumStock: 200 },
    { materialCode: "CRGO-001", materialName: "CRGO", category: "Core", unit: "Kg", currentStock: 500, reservedStock: 100, minimumStock: 150 },
    { materialCode: "YC-001", materialName: "Yoke Clamp", category: "Structural", unit: "Nos", currentStock: 80, reservedStock: 10, minimumStock: 20 },
    { materialCode: "CON-001", materialName: "Connector", category: "Electrical", unit: "Nos", currentStock: 40, reservedStock: 5, minimumStock: 15 },
    { materialCode: "INS-001", materialName: "Insulation Paper", category: "Insulation", unit: "Kg", currentStock: 300, reservedStock: 50, minimumStock: 100 },
  ];

  const materialDocs = {};
  for (const m of materialsToSeed) {
    let doc = await Material.findOne({ materialCode: m.materialCode });
    if (!doc) doc = await Material.create(m);
    materialDocs[m.materialCode] = doc;
  }
  console.log("Materials seeded");

  // Purchasers
  const purchasersToSeed = [
    { name: "Rajesh Kumar", email: "rajesh@transformer.com", phone: "9876500001", designation: "Senior Purchaser" },
    { name: "Amit Sharma", email: "amit@transformer.com", phone: "9876500002", designation: "Purchaser" },
    { name: "Priya Singh", email: "priya@transformer.com", phone: "9876500003", designation: "Purchaser" },
  ];

  const purchaserDocs = {};
  for (const p of purchasersToSeed) {
    let doc = await Purchaser.findOne({ email: p.email });
    if (!doc) doc = await Purchaser.create(p);
    purchaserDocs[p.name] = doc;
  }
  console.log("Purchasers seeded");

  // Material -> Purchaser mappings
  const mappings = [
    { materialCode: "CU-001", purchaserName: "Rajesh Kumar" },
    { materialCode: "CRGO-001", purchaserName: "Amit Sharma" },
    { materialCode: "CON-001", purchaserName: "Priya Singh" },
    { materialCode: "YC-001", purchaserName: "Amit Sharma" },
    { materialCode: "INS-001", purchaserName: "Priya Singh" },
  ];

  for (const map of mappings) {
    const materialId = materialDocs[map.materialCode]._id;
    const purchaserId = purchaserDocs[map.purchaserName]._id;
    await MaterialPurchaser.findOneAndUpdate(
      { materialId },
      { materialId, purchaserId },
      { upsert: true }
    );
  }
  console.log("Material-purchaser mappings seeded");

  console.log("\nSeed complete. Login with:");
  console.log("  admin@transformer.com / Admin@123");
  console.log("  planner@transformer.com / Planner@123");
  console.log("  rajesh@transformer.com / Purchase@123");

 // Don't close connection when called from seedRoute — server is using it
  if (require.main === module) {
    await mongoose.connection.close();
    process.exit(0);
  }
};

// Direct run: node utils/seed.js  or  npm run seed
if (require.main === module) {
  run().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
}

// Export for seedRoute (Render deployment)
module.exports = run;