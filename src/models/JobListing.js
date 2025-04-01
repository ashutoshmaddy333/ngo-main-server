const mongoose = require("mongoose")
const BaseListing = require("./BaseListing")
const citiesByState = require("../models/Cities")

const JobListing = BaseListing.discriminator(
  "JobListing",
  new mongoose.Schema({
    title: { type: String, required: false, trim: true }, // Override as optional
    description: { type: String, required: false, trim: true }, // Override as optional
    // Job Information
    jobTitle: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
    },
    jobDescription: {
      type: String,
      trim: true,
    },

    // Sub-Category Information
    subCategory: {
      type: String,
      required: [true, "Sub-category is required"],
      trim: true,
    },

    // Number of Positions
    numberOfServices: {
      type: Number,
      required: [true, "Number of positions is required"],
      min: [1, "Minimum number of positions is 1"],
    },

    // Location Information
    state: {
      type: String,
      required: true,
      enum: Object.keys(citiesByState), // Ensure citiesByState is a valid object
    },
    city: {
      type: String,
      required: true,
      validate: {
        validator: function (city) {
          const state = this.get("state") // Get state dynamically
          return citiesByState[state] && Array.isArray(citiesByState[state])
            ? citiesByState[state].includes(city)
            : false
        },
        message: "Selected city is not valid for the chosen state.",
      },
    },
    pincode: {
      type: String,
      required: true, // ✅ Ensure required is a boolean, not an array
      trim: true,
      match: [/^\d{6}$/, "Please provide a valid 6-digit pincode"],
    },

    // File Upload
    files: {
      type: [String],
      validate: {
        validator: (val) => val.length <= 4,
        message: "You can upload up to 4 files only.",
      },
    },

    // Terms Acceptance
    termsAccepted: {
      type: Boolean,
      required: [true, "You must accept the terms and conditions"],
      default: false,
    },
  }),
)

module.exports = JobListing

