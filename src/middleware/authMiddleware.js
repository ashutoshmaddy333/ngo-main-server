const jwt = require("jsonwebtoken")
const User = require("../models/User")

// Middleware to protect routes
const protect = async (req, res, next) => {
  let token

  // Check if token exists in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1]

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      // Find user by ID from token payload, exclude password
      req.user = await User.findById(decoded.id).select("-password")

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Not authorized, user not found",
        })
      }

      next()
    } catch (error) {
      console.error(error)
      return res.status(401).json({
        success: false,
        message: "Not authorized, token failed",
      })
    }
  }

  // If no token
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token",
    })
  }
}

// Ensure the admin role is properly handled
// Middleware to check admin role
const adminProtect = (req, res, next) => {
  // Ensure user is authenticated first
  protect(req, res, () => {
    if (req.user && req.user.role === "admin") {
      next()
    } else {
      return res.status(403).json({
        success: false,
        message: "Not authorized as admin",
      })
    }
  })
}

// Add this new middleware function after adminProtect
// Middleware to check if user is admin or moderator
const adminOrModeratorProtect = (req, res, next) => {
  // Ensure user is authenticated first
  protect(req, res, () => {
    if (req.user && (req.user.role === "admin" || req.user.role === "moderator")) {
      next()
    } else {
      return res.status(403).json({
        success: false,
        message: "Not authorized as admin or moderator",
      })
    }
  })
}

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d", // 30 days
  })
}

// Update the module.exports to include the new middleware
module.exports = {
  protect,
  adminProtect,
  adminOrModeratorProtect,
  generateToken,
}

