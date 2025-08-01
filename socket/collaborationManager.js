export class CollaborationManager {
  constructor(io) {
    this.io = io
    this.componentLocks = new Map() // dashboardId -> Map(componentId -> userId)
    this.operationQueue = new Map() // dashboardId -> Array of operations
    this.conflictResolver = new ConflictResolver()
  }

  // Lock a component for editing
  lockComponent(dashboardId, componentId, userId, userName) {
    if (!this.componentLocks.has(dashboardId)) {
      this.componentLocks.set(dashboardId, new Map())
    }

    const dashboardLocks = this.componentLocks.get(dashboardId)

    // Check if already locked by someone else
    if (dashboardLocks.has(componentId) && dashboardLocks.get(componentId) !== userId) {
      return false
    }

    dashboardLocks.set(componentId, userId)

    // Broadcast lock to all users
    this.io.to(dashboardId).emit("component-locked", {
      componentId,
      lockedBy: { id: userId, name: userName },
      timestamp: new Date().toISOString(),
    })

    return true
  }

  // Unlock a component
  unlockComponent(dashboardId, componentId, userId) {
    const dashboardLocks = this.componentLocks.get(dashboardId)
    if (!dashboardLocks) return

    // Only the user who locked it can unlock
    if (dashboardLocks.get(componentId) === userId) {
      dashboardLocks.delete(componentId)

      this.io.to(dashboardId).emit("component-unlocked", {
        componentId,
        timestamp: new Date().toISOString(),
      })
    }
  }

  // Queue operations for conflict resolution
  queueOperation(dashboardId, operation) {
    if (!this.operationQueue.has(dashboardId)) {
      this.operationQueue.set(dashboardId, [])
    }

    const queue = this.operationQueue.get(dashboardId)
    queue.push({
      ...operation,
      id: this.generateOperationId(),
      timestamp: new Date().toISOString(),
    })

    // Process queue
    this.processOperationQueue(dashboardId)
  }

  processOperationQueue(dashboardId) {
    const queue = this.operationQueue.get(dashboardId)
    if (!queue || queue.length === 0) return

    // Sort by timestamp
    queue.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

    // Apply operations in order
    const processedOps = []
    for (const operation of queue) {
      const resolved = this.conflictResolver.resolve(operation, processedOps)
      if (resolved) {
        processedOps.push(resolved)

        // Broadcast resolved operation
        this.io.to(dashboardId).emit("operation-applied", resolved)
      }
    }

    // Clear processed operations
    this.operationQueue.set(dashboardId, [])
  }

  generateOperationId() {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Clean up locks when user disconnects
  cleanupUserLocks(dashboardId, userId) {
    const dashboardLocks = this.componentLocks.get(dashboardId)
    if (!dashboardLocks) return

    const lockedComponents = []
    for (const [componentId, lockUserId] of dashboardLocks.entries()) {
      if (lockUserId === userId) {
        dashboardLocks.delete(componentId)
        lockedComponents.push(componentId)
      }
    }

    // Broadcast unlocked components
    if (lockedComponents.length > 0) {
      this.io.to(dashboardId).emit("components-unlocked", {
        componentIds: lockedComponents,
        reason: "user-disconnected",
      })
    }
  }
}

// Conflict resolution for simultaneous edits
class ConflictResolver {
  resolve(operation, existingOperations) {
    // Implement operational transformation logic
    switch (operation.type) {
      case "component-move":
        return this.resolveMove(operation, existingOperations)
      case "component-resize":
        return this.resolveResize(operation, existingOperations)
      case "component-update":
        return this.resolveUpdate(operation, existingOperations)
      default:
        return operation
    }
  }

  resolveMove(operation, existingOperations) {
    // Check for conflicting moves
    const conflictingMoves = existingOperations.filter(
      (op) => op.type === "component-move" && op.componentId === operation.componentId,
    )

    if (conflictingMoves.length === 0) {
      return operation
    }

    // Use timestamp to determine winner
    const latestMove = conflictingMoves.reduce((latest, current) =>
      new Date(current.timestamp) > new Date(latest.timestamp) ? current : latest,
    )

    return new Date(operation.timestamp) > new Date(latestMove.timestamp) ? operation : null
  }

  resolveResize(operation, existingOperations) {
    // Similar logic for resize conflicts
    return operation
  }

  resolveUpdate(operation, existingOperations) {
    // Merge property updates
    const conflictingUpdates = existingOperations.filter(
      (op) => op.type === "component-update" && op.componentId === operation.componentId,
    )

    if (conflictingUpdates.length === 0) {
      return operation
    }

    // Merge properties, with latest timestamp winning for conflicts
    const mergedProps = { ...operation.properties }

    for (const conflictOp of conflictingUpdates) {
      for (const [key, value] of Object.entries(conflictOp.properties)) {
        if (!(key in mergedProps) || new Date(conflictOp.timestamp) > new Date(operation.timestamp)) {
          mergedProps[key] = value
        }
      }
    }

    return {
      ...operation,
      properties: mergedProps,
    }
  }
}
