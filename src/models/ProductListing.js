const mongoose = require("mongoose")
const BaseListing = require("./BaseListing")
const citiesByState = require("../models/Cities") || {} // Prevents crash if undefined

const ProductListing = BaseListing.discriminator(
  "ProductListing",
  new mongoose.Schema({
    // Basic Product Information
    title: {
      type: String,
      required: [true, "Product title is required"],
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

    // Quantity
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Minimum quantity is 1"],
    },

    // Location Information
    state: {
      type: String,
      required: true,
      enum: Object.keys(citiesByState), // Ensures valid states
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
      required: true,
      trim: true,
      match: [/^\d{6}$/, "Please provide a valid 6-digit pincode"],
    },

    // File Upload
    files: {
      type: [String], // Allows multiple file paths/URLs
      validate: {
        validator: (files) => Array.isArray(files) && files.length <= 4,
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

module.exports = ProductListing

