const express = require("express")
const router = express.Router()
const {
  getDashboardStatistics,
  getUsers,
  bulkUserActions,
  bulkListingActions,
  updateSystemConfiguration,
} = require("../controllers/adminController")
const { protect, adminProtect } = require("../middleware/authMiddleware")

// Dashboard statistics
router.get("/dashboard", protect, adminProtect, getDashboardStatistics)

// User management routes
router.get("/users", protect, adminProtect, getUsers)
router.post("/users/bulk", protect, adminProtect, bulkUserActions)

// Listing management routes
router.post("/listings/bulk", protect, adminProtect, bulkListingActions)

// System configuration
router.put("/system-config", protect, adminProtect, updateSystemConfiguration)

module.exports = router

