const mongoose = require("mongoose")
require("dotenv").config() // Load environment variables

console.log("🔍 MONGODB_URI:", process.env.MONGODB_URI) // Debugging Line

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("❌ MONGODB_URI is not defined in .env file!")
    }

    console.log("🔄 Connecting to MongoDB...")

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // Increase timeout
    })

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)

    // Drop the unique index on username field
    const db = conn.connection.db
    const collection = db.collection("users")

    const indexes = await collection.indexes()

    const indexExists = indexes.some((index) => index.name === "username_1")

    if (indexExists) {
      await collection.dropIndex("username_1")
    }

    // Check if super admin exists, if not create one
    const User = require("../models/User")
    const adminExists = await User.findOne({ email: "admin@example.com", role: "admin" })
    const modExists = await User.findOne({ email: "moderator123@example.com", role: "moderator" })

    if (!adminExists) {
      console.log("Creating super admin account...")
      const bcrypt = require("bcryptjs")
      const hashedPassword = await bcrypt.hash("Admin@123", 10)

      await User.create({
        firstName: "Super",
        lastName: "Admin",
        email: "admin@example.com",
        phoneNumber: "9999999999",
        gender: "Male",
        pincode: "123456",
        state: "Delhi",
        city: "New Delhi",
        password: hashedPassword,
        confirmPassword: hashedPassword,
        role: "admin",
      })

      console.log("Super admin account created successfully")
    }


    if (!modExists) {
      console.log("Creating moderator account...")
      const bcrypt = require("bcryptjs")
      const hashedPassword = await bcrypt.hash("Moderator@1234", 10)

      await User.create({
        firstName: "Super",
        lastName: "Moderator",
        email: "moderator123@example.com",
        phoneNumber: "9999999999",
        gender: "Male",
        pincode: "123456",
        state: "Delhi",
        city: "New Delhi",
        password: hashedPassword,
        confirmPassword: hashedPassword,
        role: "moderator",
      })

      console.log("Super moderator account created successfully")
    }

  } catch (error) {
    console.error(`❌ Connection Failed: ${error.message}`)
  }
}

module.exports = connectDB

