const ensureModerator = (req, res, next) => {
  // Ensure user is authenticated first
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, user not found",
    })
  }

  // Check if the user is a moderator
  if (req.user.role === "moderator") {
    next() // Allow access to the route
  } else {
    return res.status(403).json({
      success: false,
      message: "Not authorized as moderator",
    })
  }
}

module.exports = { ensureModerator }

