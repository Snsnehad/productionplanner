const { Worker } = require("bullmq");
const { getRedisConnection } = require("../config/redis");
const ProductionPlan = require("../models/ProductionPlan");
const PlanMaterial = require("../models/PlanMaterial");
const Material = require("../models/Material");
const { createShortageNotification } = require("../services/notificationService");

const LOOKAHEAD_DAYS = Number(process.env.PLAN_LOOKAHEAD_DAYS) || 2;

// Exact same logic as the old shortageScheduler — just moved into a BullMQ worker.
// BullMQ calls this function whenever a "shortage-check" job is dequeued.
const processShortageCheck = async (job) => {
  const now = new Date();
  const windowEnd = new Date(now.getTime() + LOOKAHEAD_DAYS * 24 * 60 * 60 * 1000);

  const plans = await ProductionPlan.find({
    startDate: { $gte: now, $lte: windowEnd },
    status: { $in: ["draft", "approved"] },
  });

  let shortagesFound = 0;

  for (const plan of plans) {
    const planMaterials = await PlanMaterial.find({ planId: plan._id });

    for (const pm of planMaterials) {
      const material = await Material.findById(pm.materialId);
      if (!material) continue;

      const availableQty = material.currentStock - material.reservedStock;
      const currentShortage = Math.max(0, pm.requiredQty - (pm.reservedQty + availableQty));

      if (currentShortage > 0) {
        if (currentShortage !== pm.shortageQty) {
          pm.shortageQty = currentShortage;
          await pm.save();
        }

        await createShortageNotification({
          plan,
          material,
          shortageQty: currentShortage,
          requiredQty: pm.requiredQty,
          availableQty,
        });

        shortagesFound++;
      }
    }
  }

  console.log(
    `[shortageWorker] job#${job.id} — checked ${plans.length} plan(s), ${shortagesFound} shortage(s) found`
  );

  return { plansChecked: plans.length, shortagesFound };
};

let shortageWorker = null;

const startShortageWorker = () => {
  shortageWorker = new Worker("shortage-check", processShortageCheck, {
    connection: getRedisConnection(),
    concurrency: 1, // shortage checks should be serial, not concurrent
  });

  shortageWorker.on("completed", (job, result) => {
    console.log(`[shortageWorker] completed job#${job.id}:`, result);
  });

  shortageWorker.on("failed", (job, err) => {
    console.error(`[shortageWorker] failed job#${job?.id}:`, err.message);
  });

  console.log("[shortageWorker] Worker started — listening for shortage-check jobs");
  return shortageWorker;
};

const stopShortageWorker = async () => {
  if (shortageWorker) await shortageWorker.close();
};

module.exports = { startShortageWorker, stopShortageWorker };
