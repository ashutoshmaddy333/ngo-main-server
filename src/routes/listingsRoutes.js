const express = require("express");
const router = express.Router();
const {
  createListing,
  getListings,
  getSingleListing,
  updateListing,
  deleteListing,
  searchListings,
  getMyListings,
} = require("../controllers/listingsController");
const { protect, adminProtect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Search route (public)
router.get("/my-listings", protect, getMyListings);

router.get("/search", searchListings);

// Document upload/delete routes for matrimony listings
router.post("/:type/:id/documents", protect, upload.array("documents", 4), async (req, res) => {
  try {
    const { type, id } = req.params;
    const MatrimonyListing = require("../models/MatrimonyListing");
    
    // Only allow document uploads for matrimony listings
    if (type !== "matrimony") {
      return res.status(400).json({ message: "Document uploads only supported for matrimony listings" });
    }
    
    const listing = await MatrimonyListing.findById(id);
    
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }
    
    // Check if this listing belongs to the current user
    if (listing.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this listing" });
    }
    
    // Process uploaded files
    const uploadedFiles = req.files.map(file => ({
      url: `/uploads/${file.filename}`, // URL to access the file
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size
    }));
    
    // Add new documents to the listing
    if (!listing.documents) {
      listing.documents = [];
    }
    
    // Check if we'll exceed the 4 document limit
    if (listing.documents.length + uploadedFiles.length > 4) {
      return res.status(400).json({ message: "Maximum of 4 documents allowed" });
    }
    
    listing.documents = [...listing.documents, ...uploadedFiles];
    await listing.save();
    
    res.status(200).json({ 
      message: "Files uploaded successfully", 
      documents: listing.documents 
    });
  } catch (error) {
    console.error("Error uploading files:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.delete("/:type/:id/documents/:documentId", protect, async (req, res) => {
  try {
    const { type, id, documentId } = req.params;
    const path = require("path");
    const fs = require("fs");
    const MatrimonyListing = require("../models/MatrimonyListing");
    
    // Only allow document deletion for matrimony listings
    if (type !== "matrimony") {
      return res.status(400).json({ message: "Document operations only supported for matrimony listings" });
    }
    
    const listing = await MatrimonyListing.findById(id);
    
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }
    
    // Check if this listing belongs to the current user
    if (listing.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this listing" });
    }
    
    // Find the document
    const documentIndex = listing.documents.findIndex(doc => doc._id.toString() === documentId);
    
    if (documentIndex === -1) {
      return res.status(404).json({ message: "Document not found" });
    }
    
    // Get file path to delete from filesystem
    const fileUrl = listing.documents[documentIndex].url;
    const filePath = path.join(__dirname, "..", fileUrl);
    
    // Remove from filesystem if it exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Remove from the listing
    listing.documents.splice(documentIndex, 1);
    await listing.save();
    
    res.status(200).json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("Error deleting document:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Routes for specific listing types
router
  .route("/:type")
  .post(protect, upload.array("images", 5), createListing) // Create a new listing with image upload
  .get(getListings); // Get all listings of a type

router
  .route("/:type/:id")
  .get(getSingleListing) // Get a single listing
  .put(protect, upload.array("images", 5), updateListing) // Update a listing with image upload
  .delete(protect, deleteListing); // Delete/Deactivate a listing

// Admin routes
router.get("/admin/:type", protect, adminProtect, getListings);

module.exports = router;