const mongoose = require("mongoose")
const BaseListing = require("./BaseListing")
const citiesByState = require("../models/Cities") || {} // Prevent crash if undefined

const ServiceListing = BaseListing.discriminator(
  "ServiceListing",
  new mongoose.Schema({
    // Service Information
    title: {
      type: String,
      required: [true, "Service title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },

    // Category Information

    subCategory: {
      type: String,
      required: [true, "Sub-category is required"],
      trim: true,
    },

    // Number of Services
    numberOfServices: {
      type: Number,
      required: [true, "Number of services is required"],
      min: [1, "Minimum number of services is 1"],
    },

    // Location Information
    state: {
      type: String,
      enum: Object.keys(citiesByState), // ✅ Prevents crash if citiesByState is undefined
      required: true,
    },
    city: {
      type: String,
      required: true,
      validate: {
        validator: function (city) {
          return citiesByState[this.state]?.includes(city)
        },
        message: "Selected city is not valid for the chosen state.",
      },
    },
    pincode: {
      type: String,
      required: true, // ✅ Fixed required syntax
      trim: true,
      match: [/^\d{6}$/, "Please provide a valid 6-digit pincode"],
    },

    // File Upload
    files: {
      type: [String], // ✅ Ensures it's always an array
      validate: {
        validator: (files) => {
          return Array.isArray(files) && files.length <= 4 // ✅ Prevents errors if files is undefined
        },
        message: "Maximum of 4 files allowed",
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

module.exports = ServiceListing

