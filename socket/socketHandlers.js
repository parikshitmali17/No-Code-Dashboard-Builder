import jwt from "jsonwebtoken"
import User from "../models/User.js"
import Dashboard from "../models/Dashboard.js"
import { YjsHandler } from "./yjsHandler.js"

// Store active users and their cursors
const activeUsers = new Map()
const dashboardRooms = new Map()

export const setupSocketHandlers = (io) => {
  // Initialize Y.js handler
  const yjsHandler = new YjsHandler(io)

  // Socket authentication middleware (keep existing)
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token
      if (!token) {
        return next(new Error("Authentication error"))
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const user = await User.findById(decoded.id)

      if (!user) {
        return next(new Error("User not found"))
      }

      socket.userId = user._id.toString()
      socket.user = user
      next()
    } catch (error) {
      next(new Error("Authentication error"))
    }
  })

  io.on("connection", (socket) => {
    console.log(`👤 User ${socket.user.name} connected`)

    // Enhanced join dashboard with Y.js initialization
    socket.on("join-dashboard", async (dashboardId) => {
      try {
        const dashboard = await Dashboard.findById(dashboardId)
        if (!dashboard) {
          socket.emit("error", { message: "Dashboard not found" })
          return
        }

        // Check permissions with more granular roles
        const hasAccess =
          dashboard.owner.toString() === socket.userId ||
          dashboard.collaborators.some((collab) => collab.user.toString() === socket.userId) ||
          dashboard.isPublic

        if (!hasAccess) {
          socket.emit("error", { message: "Access denied" })
          return
        }

        // Determine user role for this dashboard
        let userRole = "viewer"
        if (dashboard.owner.toString() === socket.userId) {
          userRole = "owner"
        } else {
          const collaborator = dashboard.collaborators.find((collab) => collab.user.toString() === socket.userId)
          if (collaborator) {
            userRole = collaborator.role
          }
        }

        socket.join(dashboardId)
        socket.currentDashboard = dashboardId
        socket.dashboardRole = userRole

        // Enhanced user tracking with roles
        if (!dashboardRooms.has(dashboardId)) {
          dashboardRooms.set(dashboardId, new Map())
        }

        const roomUsers = dashboardRooms.get(dashboardId)
        roomUsers.set(socket.userId, {
          id: socket.userId,
          name: socket.user.name,
          avatar: socket.user.avatar,
          role: userRole,
          cursor: { x: 0, y: 0 },
          selection: null,
          socketId: socket.id,
          joinedAt: new Date(),
        })

        // Notify others with role information
        socket.to(dashboardId).emit("user-joined", {
          user: {
            id: socket.userId,
            name: socket.user.name,
            avatar: socket.user.avatar,
            role: userRole,
          },
        })

        // Send current active users
        const currentUsers = Array.from(roomUsers.values()).filter((u) => u.id !== socket.userId)
        socket.emit("active-users", currentUsers)

        // Initialize Y.js document
        socket.emit("init-yjs-document", { dashboardId })

        console.log(`📊 User ${socket.user.name} (${userRole}) joined dashboard ${dashboardId}`)
      } catch (error) {
        socket.emit("error", { message: "Error joining dashboard" })
      }
    })

    // Enhanced canvas updates with permission checking
    socket.on("update-canvas", async (data) => {
      const { dashboardId, operation, componentId, changes } = data

      if (socket.currentDashboard !== dashboardId) {
        return
      }

      // Check write permissions
      if (socket.dashboardRole === "viewer") {
        socket.emit("error", { message: "Insufficient permissions to edit" })
        return
      }

      // Broadcast granular updates instead of full patches
      socket.to(dashboardId).emit("canvas-updated", {
        operation, // 'add', 'update', 'delete', 'move'
        componentId,
        changes,
        userId: socket.userId,
        userName: socket.user.name,
        timestamp: new Date().toISOString(),
      })

      console.log(`🔄 Canvas ${operation} from ${socket.user.name} in dashboard ${dashboardId}`)
    })

    // Enhanced cursor tracking with selection state
    socket.on("cursor-move", (data) => {
      const { dashboardId, x, y, selection } = data

      if (socket.currentDashboard !== dashboardId) {
        return
      }

      const roomUsers = dashboardRooms.get(dashboardId)
      if (roomUsers && roomUsers.has(socket.userId)) {
        const user = roomUsers.get(socket.userId)
        user.cursor = { x, y }
        user.selection = selection

        socket.to(dashboardId).emit("cursor-updated", {
          userId: socket.userId,
          userName: socket.user.name,
          cursor: { x, y },
          selection,
        })
      }
    })

    // Component locking mechanism
    socket.on("lock-component", (data) => {
      const { dashboardId, componentId } = data

      if (socket.currentDashboard !== dashboardId || socket.dashboardRole === "viewer") {
        return
      }

      socket.to(dashboardId).emit("component-locked", {
        componentId,
        lockedBy: {
          id: socket.userId,
          name: socket.user.name,
        },
        timestamp: new Date().toISOString(),
      })
    })

    socket.on("unlock-component", (data) => {
      const { dashboardId, componentId } = data

      if (socket.currentDashboard !== dashboardId) {
        return
      }

      socket.to(dashboardId).emit("component-unlocked", {
        componentId,
        unlockedBy: {
          id: socket.userId,
          name: socket.user.name,
        },
        timestamp: new Date().toISOString(),
      })
    })

    // Enhanced save with conflict resolution
    socket.on("save-dashboard", async (data) => {
      const { dashboardId, layoutSchema, version } = data

      try {
        const dashboard = await Dashboard.findById(dashboardId)
        if (!dashboard) {
          socket.emit("error", { message: "Dashboard not found" })
          return
        }

        if (socket.dashboardRole === "viewer") {
          socket.emit("error", { message: "Insufficient permissions to save" })
          return
        }

        // Check for version conflicts
        if (version && dashboard.version > version) {
          socket.emit("save-conflict", {
            currentVersion: dashboard.version,
            yourVersion: version,
            message: "Dashboard was modified by another user",
          })
          return
        }

        dashboard.layoutSchema = layoutSchema
        dashboard.lastModifiedBy = socket.userId
        dashboard.version += 1
        await dashboard.save()

        io.to(dashboardId).emit("dashboard-saved", {
          version: dashboard.version,
          lastModified: dashboard.lastModified,
          savedBy: socket.user.name,
          timestamp: new Date().toISOString(),
        })

        console.log(`💾 Dashboard ${dashboardId} saved by ${socket.user.name}`)
      } catch (error) {
        socket.emit("error", { message: "Error saving dashboard" })
      }
    })

    // Enhanced disconnect handling
    socket.on("disconnect", () => {
      console.log(`👋 User ${socket.user.name} disconnected`)

      if (socket.currentDashboard) {
        const roomUsers = dashboardRooms.get(socket.currentDashboard)
        if (roomUsers) {
          roomUsers.delete(socket.userId)

          socket.to(socket.currentDashboard).emit("user-left", {
            userId: socket.userId,
            userName: socket.user.name,
          })

          // Clean up Y.js document if no users left
          if (roomUsers.size === 0) {
            yjsHandler.cleanupDocument(socket.currentDashboard)
            dashboardRooms.delete(socket.currentDashboard)
          }
        }
      }

      activeUsers.delete(socket.userId)
    })

    // Keep existing typing indicators and other handlers...
    socket.on("typing-start", (data) => {
      const { dashboardId } = data
      if (socket.currentDashboard === dashboardId) {
        socket.to(dashboardId).emit("user-typing", {
          userId: socket.userId,
          userName: socket.user.name,
          isTyping: true,
        })
      }
    })

    socket.on("typing-stop", (data) => {
      const { dashboardId } = data
      if (socket.currentDashboard === dashboardId) {
        socket.to(dashboardId).emit("user-typing", {
          userId: socket.userId,
          userName: socket.user.name,
          isTyping: false,
        })
      }
    })
  })

  console.log("🔌 Enhanced Socket.IO + Y.js handlers configured")
}
