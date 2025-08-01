"use client"
import { motion } from "framer-motion"

const UserCursor = ({ userId, cursor, userName, selection }) => {
  if (!cursor) return null

  // Generate a consistent color for each user
  const getUserColor = (userId) => {
    const colors = [
      "#3B82F6", // blue
      "#10B981", // green
      "#F59E0B", // yellow
      "#EF4444", // red
      "#8B5CF6", // purple
      "#F97316", // orange
      "#06B6D4", // cyan
      "#84CC16", // lime
    ]
    const hash = userId.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0)
      return a & a
    }, 0)
    return colors[Math.abs(hash) % colors.length]
  }

  const color = getUserColor(userId)

  return (
    <motion.div
      className="absolute pointer-events-none z-50"
      style={{
        left: cursor.x,
        top: cursor.y,
        transform: "translate(-2px, -2px)",
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
    >
      {/* Cursor */}
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3 3L17 9L10 10L9 17L3 3Z" fill={color} stroke="white" strokeWidth="1" />
      </svg>

      {/* User name label */}
      <div
        className="absolute top-5 left-2 px-2 py-1 rounded text-xs font-medium text-white whitespace-nowrap"
        style={{ backgroundColor: color }}
      >
        {userName}
      </div>

      {/* Selection indicator */}
      {selection && (
        <div className="absolute top-8 left-2 px-2 py-1 rounded text-xs bg-black/75 text-white whitespace-nowrap">
          Editing: {selection}
        </div>
      )}
    </motion.div>
  )
}

export default UserCursor
