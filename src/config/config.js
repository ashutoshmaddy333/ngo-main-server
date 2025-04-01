const config = {
  env: process.env.NODE_ENV || "development",
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
}

module.exports = config

