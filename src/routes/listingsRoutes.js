const express = require("express")
const router = express.Router()
const {
  createListing,
  getListings,
  getSingleListing,
  updateListing,
  deleteListing,
  searchListings,
  getMyListings,
} = require("../controllers/listingsController")
const { protect, adminProtect } = require("../middleware/authMiddleware")
const upload = require("../middleware/uploadMiddleware")

// Search route (public)
router.get("/my-listings", protect, getMyListings)

router.get("/search", searchListings)

// Routes for specific listing types
router
  .route("/:type")
  .post(protect, upload.array("images", 5), createListing) // Create a new listing with image upload
  .get(getListings) // Get all listings of a type

router
  .route("/:type/:id")
  .get(getSingleListing) // Get a single listing
  .put(protect, upload.array("images", 5), updateListing) // Update a listing with image upload
  .delete(protect, deleteListing) // Delete/Deactivate a listing

// Admin routes
router.get("/admin/:type", protect, adminProtect, getListings)

module.exports = router

