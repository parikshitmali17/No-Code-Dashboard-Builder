import * as Y from "yjs"
import * as syncProtocol from "y-protocols/sync.js"
import * as awarenessProtocol from "y-protocols/awareness.js"
import * as encoding from "lib0/encoding.js"
import * as decoding from "lib0/decoding.js"
import Dashboard from "../models/Dashboard.js"

// Store Y.js documents per dashboard
const yjsDocuments = new Map()
const yjsAwareness = new Map()

// Message types for Y.js protocol
const messageSync = 0
const messageAwareness = 1
const messageAuth = 2

export class YjsHandler {
  constructor(io) {
    this.io = io
    this.setupYjsHandlers()
  }

  setupYjsHandlers() {
    this.io.on("connection", (socket) => {
      // Handle Y.js document synchronization
      socket.on("yjs-message", async (data) => {
        const { dashboardId, message } = data

        if (!socket.currentDashboard || socket.currentDashboard !== dashboardId) {
          return
        }

        try {
          await this.handleYjsMessage(socket, dashboardId, new Uint8Array(message))
        } catch (error) {
          console.error("Y.js message error:", error)
          socket.emit("yjs-error", { message: "Failed to process Y.js message" })
        }
      })

      // Handle awareness updates (cursors, selections, etc.)
      socket.on("awareness-update", (data) => {
        const { dashboardId, update } = data

        if (!socket.currentDashboard || socket.currentDashboard !== dashboardId) {
          return
        }

        this.handleAwarenessUpdate(socket, dashboardId, new Uint8Array(update))
      })

      // Initialize Y.js document when joining dashboard
      socket.on("init-yjs-document", async (data) => {
        const { dashboardId } = data

        if (!socket.currentDashboard || socket.currentDashboard !== dashboardId) {
          return
        }

        await this.initializeYjsDocument(socket, dashboardId)
      })
    })
  }

  async handleYjsMessage(socket, dashboardId, message) {
    const ydoc = this.getOrCreateDocument(dashboardId)
    const encoder = encoding.createEncoder()
    const decoder = decoding.createDecoder(message)
    const messageType = decoding.readVarUint(decoder)

    switch (messageType) {
      case messageSync:
        encoding.writeVarUint(encoder, messageSync)
        syncProtocol.readSyncMessage(decoder, encoder, ydoc, socket)

        // Broadcast sync message to other clients in the room
        if (encoding.length(encoder) > 1) {
          const syncMessage = encoding.toUint8Array(encoder)
          socket.to(dashboardId).emit("yjs-message", {
            dashboardId,
            message: Array.from(syncMessage),
          })
        }
        break

      case messageAuth:
        // Handle authentication for Y.js operations
        await this.handleYjsAuth(socket, dashboardId, decoder)
        break

      default:
        console.warn("Unknown Y.js message type:", messageType)
    }

    // Persist document changes to database periodically
    this.scheduleDocumentPersistence(dashboardId)
  }

  handleAwarenessUpdate(socket, dashboardId, update) {
    const awareness = this.getOrCreateAwareness(dashboardId)

    // Apply awareness update
    awarenessProtocol.applyAwarenessUpdate(awareness, update, socket)

    // Broadcast to other clients
    socket.to(dashboardId).emit("awareness-update", {
      dashboardId,
      update: Array.from(update),
    })
  }

  async initializeYjsDocument(socket, dashboardId) {
    const ydoc = this.getOrCreateDocument(dashboardId)
    const awareness = this.getOrCreateAwareness(dashboardId)

    // Load existing document state from database
    await this.loadDocumentFromDatabase(dashboardId, ydoc)

    // Send initial sync message
    const encoder = encoding.createEncoder()
    encoding.writeVarUint(encoder, messageSync)
    syncProtocol.writeSyncStep1(encoder, ydoc)

    socket.emit("yjs-message", {
      dashboardId,
      message: Array.from(encoding.toUint8Array(encoder)),
    })

    // Send current awareness state
    const awarenessUpdate = awarenessProtocol.encodeAwarenessUpdate(awareness, Array.from(awareness.getStates().keys()))

    socket.emit("awareness-update", {
      dashboardId,
      update: Array.from(awarenessUpdate),
    })

    console.log(`📄 Y.js document initialized for dashboard ${dashboardId}`)
  }

  getOrCreateDocument(dashboardId) {
    if (!yjsDocuments.has(dashboardId)) {
      const ydoc = new Y.Doc()

      // Set up document update handler
      ydoc.on("update", (update) => {
        this.handleDocumentUpdate(dashboardId, update)
      })

      yjsDocuments.set(dashboardId, ydoc)
      console.log(`📄 Created new Y.js document for dashboard ${dashboardId}`)
    }

    return yjsDocuments.get(dashboardId)
  }

  getOrCreateAwareness(dashboardId) {
    if (!yjsAwareness.has(dashboardId)) {
      const ydoc = this.getOrCreateDocument(dashboardId)
      const awareness = new awarenessProtocol.Awareness(ydoc)

      // Handle awareness changes
      awareness.on("change", ({ added, updated, removed }) => {
        const changedClients = added.concat(updated, removed)
        if (changedClients.length > 0) {
          const update = awarenessProtocol.encodeAwarenessUpdate(awareness, changedClients)
          this.io.to(dashboardId).emit("awareness-update", {
            dashboardId,
            update: Array.from(update),
          })
        }
      })

      yjsAwareness.set(dashboardId, awareness)
    }

    return yjsAwareness.get(dashboardId)
  }

  async loadDocumentFromDatabase(dashboardId, ydoc) {
    try {
      const dashboard = await Dashboard.findById(dashboardId)
      if (dashboard && dashboard.layoutSchema) {
        // Convert layoutSchema to Y.js document structure
        const yMap = ydoc.getMap("dashboard")
        yMap.set("components", dashboard.layoutSchema.components || [])
        yMap.set("layout", dashboard.layoutSchema.layout || { rows: 12, cols: 12 })
        yMap.set("theme", dashboard.layoutSchema.theme || "light")
        yMap.set("version", dashboard.version || 1)
      }
    } catch (error) {
      console.error("Error loading document from database:", error)
    }
  }

  handleDocumentUpdate(dashboardId, update) {
    // Broadcast update to all clients in the room
    this.io.to(dashboardId).emit("yjs-update", {
      dashboardId,
      update: Array.from(update),
    })

    // Schedule persistence to database
    this.scheduleDocumentPersistence(dashboardId)
  }

  scheduleDocumentPersistence(dashboardId) {
    // Debounce database writes to avoid too frequent updates
    if (this.persistenceTimeouts) {
      clearTimeout(this.persistenceTimeouts.get(dashboardId))
    } else {
      this.persistenceTimeouts = new Map()
    }

    this.persistenceTimeouts.set(
      dashboardId,
      setTimeout(() => {
        this.persistDocumentToDatabase(dashboardId)
      }, 2000), // Wait 2 seconds before persisting
    )
  }

  async persistDocumentToDatabase(dashboardId) {
    try {
      const ydoc = yjsDocuments.get(dashboardId)
      if (!ydoc) return

      const yMap = ydoc.getMap("dashboard")
      const layoutSchema = {
        components: yMap.get("components") || [],
        layout: yMap.get("layout") || { rows: 12, cols: 12 },
        theme: yMap.get("theme") || "light",
      }

      await Dashboard.findByIdAndUpdate(dashboardId, {
        layoutSchema,
        lastModified: new Date(),
        $inc: { version: 1 },
      })

      console.log(`💾 Persisted Y.js document for dashboard ${dashboardId}`)
    } catch (error) {
      console.error("Error persisting document:", error)
    }
  }

  async handleYjsAuth(socket, dashboardId, decoder) {
    // Verify user has write permissions
    const dashboard = await Dashboard.findById(dashboardId)
    if (!dashboard) {
      socket.emit("yjs-error", { message: "Dashboard not found" })
      return
    }

    const canWrite =
      dashboard.owner.toString() === socket.userId ||
      dashboard.collaborators.some((collab) => collab.user.toString() === socket.userId && collab.role === "editor")

    const encoder = encoding.createEncoder()
    encoding.writeVarUint(encoder, messageAuth)
    encoding.writeVarString(encoder, canWrite ? "authorized" : "unauthorized")

    socket.emit("yjs-message", {
      dashboardId,
      message: Array.from(encoding.toUint8Array(encoder)),
    })
  }

  // Clean up documents when no users are connected
  cleanupDocument(dashboardId) {
    if (yjsDocuments.has(dashboardId)) {
      const ydoc = yjsDocuments.get(dashboardId)
      ydoc.destroy()
      yjsDocuments.delete(dashboardId)
    }

    if (yjsAwareness.has(dashboardId)) {
      const awareness = yjsAwareness.get(dashboardId)
      awareness.destroy()
      yjsAwareness.delete(dashboardId)
    }

    console.log(`🧹 Cleaned up Y.js document for dashboard ${dashboardId}`)
  }
}
