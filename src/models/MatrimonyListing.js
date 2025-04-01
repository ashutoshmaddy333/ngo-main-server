const mongoose = require("mongoose")
const BaseListing = require("./BaseListing")
const citiesByState = require("../models/Cities") || {} // Prevents crash if undefined

// Validate citiesByState structure
if (typeof citiesByState !== "object" || Array.isArray(citiesByState)) {
  throw new Error("Invalid citiesByState structure. Expected an object with states as keys.")
}

const MatrimonyListing = BaseListing.discriminator(
  "MatrimonyListing",
  new mongoose.Schema({
    title: { type: String, required: false, trim: true }, // Override as optional
    description: { type: String, required: false, trim: true }, // Override as optional
    // Basic Information
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    middleName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    gender: {
      type: String,
      required: [true, "Gender is required"],
      enum: ["Male", "Female", "Other"],
    },
    age: {
      type: Number,
      required: [true, "Age is required"],
      min: [18, "Minimum age is 18"],
      max: [80, "Maximum age is 80"],
    },

    // Physical Attributes
    height: {
      type: Number, // in cm
      required: [true, "Height is required"],
      min: [100, "Minimum height is 100 cm"],
      max: [250, "Maximum height is 250 cm"],
    },
    weight: {
      type: Number, // in kg
      required: [true, "Weight is required"],
      min: [30, "Minimum weight is 30 kg"],
      max: [300, "Maximum weight is 300 kg"],
    },

    // Social Details
    maritalStatus: {
      type: String,
      required: [true, "Marital status is required"],
      enum: ["Single", "Married", "Divorced", "Widowed"],
    },
    religion: {
      type: String,
      required: [true, "Religion is required"],
      trim: true,
    },
    caste: {
      type: String,
      trim: true, // Optional field now
    },
    occupation: {
      type: String,
      required: [true, "Occupation is required"],
      enum: ["Employed", "Self-Employed", "Student", "Unemployed"],
      trim: true,
    },

    // Location Information
    state: {
      type: String,
      required: true,
      enum: Object.keys(citiesByState), // Ensure valid states
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
    documents: {
      type: [String], // Allows multiple document URLs
      validate: {
        validator: (docs) => Array.isArray(docs) && docs.length <= 3,
        message: "Maximum of 3 documents allowed",
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

module.exports = MatrimonyListing

