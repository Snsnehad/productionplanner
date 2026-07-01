const express = require("express");
const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    // Simple secret check taaki koi bhi trigger na kar sake
    if (req.headers["x-seed-secret"] !== process.env.SEED_SECRET) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const seed = require("../utils/seed");
    await seed();
    res.json({ success: true, message: "Seed complete" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;