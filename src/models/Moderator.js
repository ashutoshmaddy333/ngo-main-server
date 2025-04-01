const mongoose = require("mongoose")
const User = require("./User")
const Moderator = new mongoose.Schema({
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
})

const ModeratorModel = mongoose.models.Moderator || mongoose.model("Moderator", Moderator)

module.exports = ModeratorModel

