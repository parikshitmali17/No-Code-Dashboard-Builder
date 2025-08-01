import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"
import cors from "cors"
import dotenv from "dotenv"
import helmet from "helmet"
import compression from "compression"
import connectDB from "./config/database.js"
import authRoutes from "./routes/auth.js"
import dashboardRoutes from "./routes/dashboards.js"
import dataSourceRoutes from "./routes/dataSources.js"
import { errorHandler } from "./middleware/errorHandler.js"
import { setupSocketHandlers } from "./socket/socketHandlers.js"
import { CollaborationManager } from "./socket/collaborationManager.js"

dotenv.config()

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
})

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }),
)
app.use(compression())

// Connect to MongoDB
connectDB()

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
)
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/dashboards", dashboardRoutes)
app.use("/api/datasources", dataSourceRoutes)

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() })
})

// Socket.IO setup
const collaborationManager = new CollaborationManager(io)
setupSocketHandlers(io, collaborationManager)

// Error handling middleware
app.use(errorHandler)

const PORT = process.env.PORT || 5000

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📊 Dashboard Backend ready for collaboration!`)
})

export { io }
