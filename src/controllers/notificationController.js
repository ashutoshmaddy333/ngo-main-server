const Notification = require("../models/Notification")
const nodemailer = require("nodemailer")
const mongoose = require("mongoose")

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail", // Or your preferred email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

// @desc    Get user notifications
// @route   GET /api/notifications
exports.getUserNotifications = async (req, res) => {
  try {
    // Pagination
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skipIndex = (page - 1) * limit

    // Filtering
    const filters = {
      user: req.user.id,
    }

    // Optional: filter by read status
    if (req.query.isRead !== undefined) {
      filters.isRead = req.query.isRead === "true"
    }

    // Execute query
    const totalNotifications = await Notification.countDocuments(filters)
    const notifications = await Notification.find(filters).sort({ createdAt: -1 }).limit(limit).skip(skipIndex)

    res.status(200).json({
      success: true,
      count: notifications.length,
      totalNotifications,
      totalPages: Math.ceil(totalNotifications / limit),
      currentPage: page,
      data: notifications,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching notifications",
      error: error.message,
    })
  }
}

// @desc    Mark notifications as read
// @route   PUT /api/notifications/mark-read
exports.markNotificationsAsRead = async (req, res) => {
  try {
    const { notificationIds } = req.body

    // Validate input
    if (!notificationIds || !Array.isArray(notificationIds)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification IDs",
      })
    }

    // Mark notifications as read
    const result = await Notification.updateMany(
      {
        _id: { $in: notificationIds },
        user: req.user.id,
        isRead: false,
      },
      {
        $set: { isRead: true },
      },
    )

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read`,
      modifiedCount: result.modifiedCount,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error marking notifications as read",
      error: error.message,
    })
  }
}

// @desc    Send email notification
// @route   Internal method
exports.sendEmailNotification = async (user, notificationType, content) => {
  try {
    // Prepare email content based on notification type
    const emailTemplates = {
      interest_received: {
        subject: "New Interest Received",
        text: `You have received a new interest: ${content}`,
      },
      interest_accepted: {
        subject: "Interest Accepted",
        text: `Your interest has been accepted: ${content}`,
      },
      interest_rejected: {
        subject: "Interest Rejected",
        text: `Your interest has been rejected: ${content}`,
      },
      listing_approved: {
        subject: "Your Ad Has Been Approved",
        text: `Your listing has been approved: ${content}`,
      },
      listing_rejected: {
        subject: "Your Ad Has Been Rejected",
        text: `Your listing has been rejected: ${content}`,
      },
      message: {
        subject: "New Message",
        text: `You have a new message: ${content}`,
      },
      default: {
        subject: "New Notification",
        text: content,
      },
    }

    // Get email template
    const template = emailTemplates[notificationType] || emailTemplates["default"]

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: template.subject,
      text: template.text,
    })

    return true
  } catch (error) {
    console.error("Email notification error:", error)
    return false
  }
}

// @desc    Delete old notifications
// @route   DELETE /api/notifications/cleanup
exports.cleanupOldNotifications = async (req, res) => {
  try {
    // Remove notifications older than 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const result = await Notification.deleteMany({
      user: req.user.id,
      createdAt: { $lt: thirtyDaysAgo },
    })

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} old notifications deleted`,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error cleaning up notifications",
      error: error.message,
    })
  }
}

// @desc    Get unread notification count
// @route   GET /api/notifications/count
exports.getUnreadNotificationCount = async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({
      user: req.user.id,
      isRead: false,
    })

    res.status(200).json({
      success: true,
      unreadCount,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching unread notification count",
      error: error.message,
    })
  }
}

