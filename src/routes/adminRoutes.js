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

// Give admin access to moderator functions
router.get("/mod/profiles", protect, adminProtect, require("../controllers/modController").getProfilesForModeration)
router.post(
  "/mod/profiles/approve-reject",
  protect,
  adminProtect,
  require("../controllers/modController").approveOrRejectProfile,
)
router.post(
  "/mod/profiles/bulk-approve-reject",
  protect,
  adminProtect,
  require("../controllers/modController").bulkApproveOrRejectProfiles,
)
router.get("/mod/interests", protect, adminProtect, require("../controllers/modController").getInterests)
router.post(
  "/mod/interests/approve-reject",
  protect,
  adminProtect,
  require("../controllers/modController").approveOrRejectInterest,
)
router.get("/mod/listings", protect, adminProtect, require("../controllers/modController").getListingsForModeration)
router.post(
  "/mod/listings/approve-reject",
  protect,
  adminProtect,
  require("../controllers/modController").approveOrRejectListing,
)
router.post(
  "/mod/listings/bulk-approve-reject",
  protect,
  adminProtect,
  require("../controllers/modController").bulkApproveOrRejectListings,
)
router.get("/mod/listings/all-ids", protect, adminProtect, require("../controllers/modController").getAllListingIds)

module.exports = router

