import jwt from "jsonwebtoken"
import User from "../models/User.js"

export const protect = async (req, res, next) => {
  try {
    let token

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1]
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Invalid token or user not found.",
      })
    }

    req.user = user
    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token.",
    })
  }
}

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Insufficient permissions.",
      })
    }
    next()
  }
}
