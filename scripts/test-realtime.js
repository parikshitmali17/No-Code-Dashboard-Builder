import { io as Client } from "socket.io-client"
import jwt from "jsonwebtoken"

const SERVER_URL = "http://localhost:5000"
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-here"

// Create test tokens
const user1Token = jwt.sign({ id: "user1" }, JWT_SECRET)
const user2Token = jwt.sign({ id: "user2" }, JWT_SECRET)

async function testRealTimeCollaboration() {
  console.log("🧪 Testing Real-Time Collaboration Features")

  // Create two client connections
  const client1 = Client(SERVER_URL, {
    auth: { token: user1Token },
  })

  const client2 = Client(SERVER_URL, {
    auth: { token: user2Token },
  })

  const dashboardId = "test-dashboard-123"

  // Test connection
  client1.on("connect", () => {
    console.log("✅ Client 1 connected")
    client1.emit("join-dashboard", dashboardId)
  })

  client2.on("connect", () => {
    console.log("✅ Client 2 connected")
    client2.emit("join-dashboard", dashboardId)
  })

  // Test user presence
  client1.on("user-joined", (data) => {
    console.log("👤 User joined:", data.user.name)
  })

  client2.on("user-joined", (data) => {
    console.log("👤 User joined:", data.user.name)
  })

  // Test Y.js document sync
  client1.on("init-yjs-document", (data) => {
    console.log("📄 Y.js document initialized for client 1")

    // Simulate document update
    setTimeout(() => {
      client1.emit("yjs-message", {
        dashboardId,
        message: [1, 2, 3, 4], // Mock Y.js update
      })
    }, 1000)
  })

  client2.on("yjs-message", (data) => {
    console.log("📄 Y.js message received by client 2")
  })

  // Test cursor tracking
  setTimeout(() => {
    client1.emit("cursor-move", {
      dashboardId,
      x: 100,
      y: 200,
      selection: "component-1",
    })
  }, 2000)

  client2.on("cursor-updated", (data) => {
    console.log("🖱️ Cursor updated:", data.cursor)
  })

  // Test component locking
  setTimeout(() => {
    client1.emit("lock-component", {
      dashboardId,
      componentId: "component-1",
    })
  }, 3000)

  client2.on("component-locked", (data) => {
    console.log("🔒 Component locked:", data.componentId)
  })

  // Clean up after 10 seconds
  setTimeout(() => {
    client1.disconnect()
    client2.disconnect()
    console.log("🧪 Test completed")
    process.exit(0)
  }, 10000)
}

// Run test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testRealTimeCollaboration()
}
