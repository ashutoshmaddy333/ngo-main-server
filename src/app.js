const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
const dotenv = require("dotenv")
const path = require("path") // Added for file path handling
const connectDB = require("./config/database") // Import the MongoDB connection function

dotenv.config() // Load environment variables

// Initialize Express
const app = express()
app.use(cors({ origin: "https://ngo-client-main.vercel.app", credentials: true }));

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" } // Allow resources to be loaded from uploads directory
})) 

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100000000000000, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later",
})
app.use(limiter)

// Middleware
app.use(express.json()) // Body parser for JSON
app.use(express.urlencoded({ extended: true })) // URL-encoded body parser

// Set up static file serving for uploads
// This allows files to be accessed via /uploads/filename
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Create uploads directory if it doesn't exist
const fs = require("fs")
const uploadDir = path.join(__dirname, "uploads")
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
  console.log("✅ Uploads directory created")
}

// Import routes
const authRoutes = require("./routes/authRoutes")
const listingsRoutes = require("./routes/listingsRoutes")
const interestRoutes = require("./routes/interestRoutes")
const notificationRoutes = require("./routes/notificationRoutes")
const adminRoutes = require("./routes/adminRoutes")
const modRoutes = require("./routes/modRoutes")

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/listings", listingsRoutes)
app.use("/api/interests", interestRoutes)
app.use("/api/notifications", notificationRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/mod", modRoutes)

// Root Route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Free Ecosystem API",
    status: "Healthy",
    timestamp: new Date().toISOString(),
  })
})

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "production" ? {} : err.stack,
  })
})

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  })
})

// Server Configuration
const PORT = process.env.PORT || 3000

// 🔄 **Connect to MongoDB before starting the server**
connectDB()
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`✅ Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
      console.log(`✅ File uploads will be stored in ${uploadDir}`)
    })

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (err) => {
      console.error(`❌ Unhandled Rejection: ${err.message}`)
      server.close(() => process.exit(1))
    })
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message)
    process.exit(1) // Exit if DB connection fails
  })

module.exports = app