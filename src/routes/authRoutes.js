const express = require("express")
const router = express.Router()
const {
  registerUser,
  loginUser,
  verifyOTP,
  getUserProfile,
  updateUserProfile,
} = require("../controllers/authController")
const { protect } = require("../middleware/authMiddleware")

// Public Routes
router.post("/register", registerUser)
router.post("/login", loginUser)
router.post("/verify-otp", verifyOTP)

// Protected Routes (require authentication)
router.get("/profile", protect, getUserProfile)
router.put("/profile", protect, updateUserProfile)

module.exports = router

