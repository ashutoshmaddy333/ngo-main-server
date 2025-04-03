const express = require("express")
const moderatorController = require("../controllers/modController")
const authMiddleware = require("../middleware/authMiddleware") // Import authMiddleware
const moderatorMiddleware = require("../middleware/modMiddleware") // Import moderatorMiddleware

const router = express.Router()

// Debugging: Log the imported middleware functions (remove in production)
console.log("authMiddleware:", authMiddleware)
console.log("moderatorMiddleware:", moderatorMiddleware)

// Apply authentication middleware to all routes in this router
router.use(authMiddleware.protect) // Use authMiddleware.protect

// Profile moderation routes (require both authentication and moderator access)
router.get("/profiles", moderatorMiddleware.ensureModerator, moderatorController.getProfilesForModeration) // Get profiles for moderation
router.post("/profiles/approve-reject", moderatorMiddleware.ensureModerator, moderatorController.approveOrRejectProfile) // Approve/reject a profile
router.post(
  "/profiles/bulk-approve-reject",
  moderatorMiddleware.ensureModerator,
  moderatorController.bulkApproveOrRejectProfiles,
) // Bulk approve/reject profiles

// Interest moderation routes (require both authentication and moderator access)
router.get("/interests", moderatorMiddleware.ensureModerator, moderatorController.getInterests) // Get list of interests
router.post(
  "/interests/approve-reject",
  moderatorMiddleware.ensureModerator,
  moderatorController.approveOrRejectInterest,
) // Approve/reject an interest

// Add new routes for listing moderation
// Listing moderation routes
router.get("/listings", moderatorMiddleware.ensureModerator, moderatorController.getListingsForModeration) // Get listings for moderation
router.post("/listings/approve-reject", moderatorMiddleware.ensureModerator, moderatorController.approveOrRejectListing) // Approve/reject a listing
router.post(
  "/listings/bulk-approve-reject",
  moderatorMiddleware.ensureModerator,
  moderatorController.bulkApproveOrRejectListings,
) // Bulk approve/reject listings

// Add this new route after the bulk-approve-reject route
router.get("/listings/all-ids", moderatorMiddleware.ensureModerator, moderatorController.getAllListingIds) // Get all listing IDs for bulk operations

module.exports = router

