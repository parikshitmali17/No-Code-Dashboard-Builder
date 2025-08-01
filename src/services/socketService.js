"use client"
import { io } from "socket.io-client"
import { store } from "../store/store"
import {
  setSocket,
  setConnected,
  setRoomId,
  setActiveUsers,
  addActiveUser,
  removeActiveUser,
  updateUserCursor,
  lockComponent,
  unlockComponent,
  setUserTyping,
} from "../store/slices/collaborationSlice"
import { updateComponent } from "../store/slices/canvasSlice"
import toast from "react-hot-toast"

class SocketService {
  constructor() {
    this.socket = null
    this.currentDashboard = null
  }

  connect(token) {
    if (this.socket?.connected) return

    this.socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
      auth: { token },
      transports: ["websocket", "polling"],
    })

    store.dispatch(setSocket(this.socket))

    // Connection events
    this.socket.on("connect", () => {
      console.log("🔌 Connected to server")
      store.dispatch(setConnected(true))
      toast.success("Connected to collaboration server")
    })

    this.socket.on("disconnect", () => {
      console.log("🔌 Disconnected from server")
      store.dispatch(setConnected(false))
      toast.error("Disconnected from server")
    })

    this.socket.on("connect_error", (error) => {
      console.error("Connection error:", error)
      toast.error("Failed to connect to server")
    })

    // Dashboard events
    this.socket.on("user-joined", (data) => {
      console.log("👤 User joined:", data.user.name)
      store.dispatch(addActiveUser(data.user))
      toast.success(`${data.user.name} joined the dashboard`)
    })

    this.socket.on("user-left", (data) => {
      console.log("👋 User left:", data.userName)
      store.dispatch(removeActiveUser(data.userId))
      toast(`${data.userName} left the dashboard`)
    })

    this.socket.on("active-users", (users) => {
      store.dispatch(setActiveUsers(users))
    })

    // Canvas events
    this.socket.on("canvas-updated", (data) => {
      const { operation, componentId, changes, userId } = data
      const state = store.getState()

      // Don't apply our own changes
      if (userId === state.auth.user?.id) return

      switch (operation) {
        case "add":
          // Handle component addition
          break
        case "update":
          store.dispatch(updateComponent({ id: componentId, updates: changes }))
          break
        case "delete":
          // Handle component deletion
          break
        case "move":
          store.dispatch(updateComponent({ id: componentId, updates: { position: changes } }))
          break
      }
    })

    // Cursor events
    this.socket.on("cursor-updated", (data) => {
      store.dispatch(updateUserCursor(data))
    })

    // Component locking
    this.socket.on("component-locked", (data) => {
      store.dispatch(lockComponent(data))
      toast(`Component locked by ${data.lockedBy.name}`)
    })

    this.socket.on("component-unlocked", (data) => {
      store.dispatch(unlockComponent(data.componentId))
    })

    // Typing indicators
    this.socket.on("user-typing", (data) => {
      store.dispatch(setUserTyping(data))
    })

    // Dashboard save events
    this.socket.on("dashboard-saved", (data) => {
      toast.success(`Dashboard saved by ${data.savedBy}`)
    })

    this.socket.on("save-conflict", (data) => {
      toast.error("Save conflict detected. Please refresh and try again.")
    })

    // Y.js events
    this.socket.on("yjs-message", (data) => {
      // Handle Y.js synchronization messages
      console.log("📄 Y.js message received")
    })

    this.socket.on("awareness-update", (data) => {
      // Handle awareness updates (cursors, selections)
      console.log("👁️ Awareness update received")
    })

    // Error handling
    this.socket.on("error", (data) => {
      toast.error(data.message || "An error occurred")
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      store.dispatch(setSocket(null))
      store.dispatch(setConnected(false))
    }
  }

  joinDashboard(dashboardId) {
    if (!this.socket) return

    this.currentDashboard = dashboardId
    this.socket.emit("join-dashboard", dashboardId)
    store.dispatch(setRoomId(dashboardId))
  }

  leaveDashboard() {
    if (!this.socket || !this.currentDashboard) return

    this.socket.emit("leave-dashboard", this.currentDashboard)
    this.currentDashboard = null
    store.dispatch(setRoomId(null))
  }

  updateCanvas(operation, componentId, changes) {
    if (!this.socket || !this.currentDashboard) return

    this.socket.emit("update-canvas", {
      dashboardId: this.currentDashboard,
      operation,
      componentId,
      changes,
    })
  }

  moveCursor(x, y, selection = null) {
    if (!this.socket || !this.currentDashboard) return

    this.socket.emit("cursor-move", {
      dashboardId: this.currentDashboard,
      x,
      y,
      selection,
    })
  }

  lockComponent(componentId) {
    if (!this.socket || !this.currentDashboard) return

    this.socket.emit("lock-component", {
      dashboardId: this.currentDashboard,
      componentId,
    })
  }

  unlockComponent(componentId) {
    if (!this.socket || !this.currentDashboard) return

    this.socket.emit("unlock-component", {
      dashboardId: this.currentDashboard,
      componentId,
    })
  }

  saveDashboard(layoutSchema, version) {
    if (!this.socket || !this.currentDashboard) return

    this.socket.emit("save-dashboard", {
      dashboardId: this.currentDashboard,
      layoutSchema,
      version,
    })
  }

  startTyping() {
    if (!this.socket || !this.currentDashboard) return

    this.socket.emit("typing-start", {
      dashboardId: this.currentDashboard,
    })
  }

  stopTyping() {
    if (!this.socket || !this.currentDashboard) return

    this.socket.emit("typing-stop", {
      dashboardId: this.currentDashboard,
    })
  }
}

export const socketService = new SocketService()
export default socketService
