const express = require("express");
const router = express.Router();
const { login, getMe, register } = require("../controllers/authController");
const { protect, authorize } = require("../middleware/auth");

router.post("/login", login);
router.get("/me", protect, getMe);
// Admin-only: create new users (planner/purchaser/admin accounts)
router.post("/register", protect, authorize("admin"), register);

module.exports = router;
