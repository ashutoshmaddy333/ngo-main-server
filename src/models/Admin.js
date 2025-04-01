const mongoose = require("mongoose")

const AdminDashboardSchema = new mongoose.Schema({
  // System-wide statistics
  totalUsers: {
    type: Number,
    default: 0,
  },
  activeUsers: {
    type: Number,
    default: 0,
  },
  totalListings: {
    type: {
      product: Number,
      service: Number,
      job: Number,
      matrimony: Number,
    },
    default: {
      product: 0,
      service: 0,
      job: 0,
      matrimony: 0,
    },
  },
  // Listing statistics
  listingStats: {
    type: {
      totalActive: Number,
      totalInactive: Number,
      totalPending: Number,
    },
    default: {
      totalActive: 0,
      totalInactive: 0,
      totalPending: 0,
    },
  },
  // User activity tracking
  userActivity: {
    type: [
      {
        date: Date,
        newUsers: Number,
        activeListings: Number,
        interests: Number,
      },
    ],
    default: [],
  },
  // Revenue and monetization (if applicable)
  revenue: {
    type: {
      total: Number,
      monthly: [
        {
          month: String,
          amount: Number,
        },
      ],
    },
    default: {
      total: 0,
      monthly: [],
    },
  },
  // Content moderation
  contentModeration: {
    reportedListings: [
      {
        listingId: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: "reportedListings.listingType",
        },
        listingType: {
          type: String,
          enum: ["ProductListing", "ServiceListing", "JobListing", "MatrimonyListing"],
        },
        reports: [
          {
            reporterId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
            },
            reason: String,
            timestamp: {
              type: Date,
              default: Date.now,
            },
          },
        ],
      },
    ],
    bannedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  // System configuration
  systemConfig: {
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    disclaimerText: String,
    termsOfService: String,
  },
  // Timestamp
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

// Static method to update dashboard statistics
AdminDashboardSchema.statics.updateStatistics = async function () {
  const User = mongoose.model("User")
  const ProductListing = mongoose.model("ProductListing")
  const ServiceListing = mongoose.model("ServiceListing")
  const JobListing = mongoose.model("JobListing")
  const MatrimonyListing = mongoose.model("MatrimonyListing")
  const Interest = mongoose.model("Interest")

  const dashboard = (await this.findOne({})) || new this()

  // Update user statistics
  dashboard.totalUsers = await User.countDocuments()
  dashboard.activeUsers = await User.countDocuments({ isActive: true })

  // Update listing statistics
  dashboard.totalListings = {
    product: await ProductListing.countDocuments(),
    service: await ServiceListing.countDocuments(),
    job: await JobListing.countDocuments(),
    matrimony: await MatrimonyListing.countDocuments(),
  }

  // Update listing status

  dashboard.listingStats = {
    totalActive:
      (await ProductListing.countDocuments({ status: "active" })) +
      (await ServiceListing.countDocuments({ status: "active" })) +
      (await JobListing.countDocuments({ status: "active" })) +
      (await MatrimonyListing.countDocuments({ status: "active" })),
    totalInactive:
      (await ProductListing.countDocuments({ status: "inactive" })) +
      (await ServiceListing.countDocuments({ status: "inactive" })) +
      (await JobListing.countDocuments({ status: "inactive" })) +
      (await MatrimonyListing.countDocuments({ status: "inactive" })),
    totalPending:
      (await ProductListing.countDocuments({ status: "pending" })) +
      (await ServiceListing.countDocuments({ status: "pending" })) +
      (await JobListing.countDocuments({ status: "pending" })) +
      (await MatrimonyListing.countDocuments({ status: "pending" })),
  }

  // Update user activity (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  dashboard.userActivity = [
    {
      date: new Date(),
      newUsers: await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      activeListings: dashboard.listingStats.totalActive,
      interests: await Interest.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    },
  ]

  await dashboard.save()
  return dashboard
}

const AdminDashboard = mongoose.model("AdminDashboard", AdminDashboardSchema)

module.exports = AdminDashboard

