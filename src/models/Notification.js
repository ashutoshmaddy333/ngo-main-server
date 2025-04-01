const mongoose = require("mongoose")

const NotificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "interest_received",
        "interest_accepted",
        "interest_rejected",
        "listing_created",
        "listing_updated",
        "message",
      ],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    relatedEntity: {
      entityId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "relatedEntity.type",
      },
      type: {
        type: String,
        enum: ["Interest", "Listing", "Message"],
      },
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 30 * 24 * 60 * 60, // 30 days
    },
  },
  {
    timestamps: true,
  },
)

// Indexing for better query performance
NotificationSchema.index({ user: 1, isRead: 1, createdAt: -1 })

// Static method to mark notifications as read
NotificationSchema.statics.markAsRead = async function (userId, notificationIds) {
  return await this.updateMany(
    {
      user: userId,
      _id: { $in: notificationIds },
      isRead: false,
    },
    {
      $set: { isRead: true },
    },
  )
}

// Static method to create a new notification
NotificationSchema.statics.createNotification = async function (payload) {
  return await this.create({
    user: payload.user,
    type: payload.type,
    content: payload.content,
    relatedEntity: payload.relatedEntity || null,
  })
}

const Notification = mongoose.model("Notification", NotificationSchema)

module.exports = Notification

