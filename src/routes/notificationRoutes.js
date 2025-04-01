const express = require("express")
const router = express.Router()
const {
  getUserNotifications,
  markNotificationsAsRead,
  cleanupOldNotifications,
  getUnreadNotificationCount,
} = require("../controllers/notificationController")
const { protect } = require("../middleware/authMiddleware")

// Get user notifications
router.get("/", protect, getUserNotifications)

// Mark notifications as read
router.put("/mark-read", protect, markNotificationsAsRead)

// Cleanup old notifications
router.delete("/cleanup", protect, cleanupOldNotifications)

// Get unread notification count
router.get("/count", protect, getUnreadNotificationCount)

module.exports = router

