import mongoose from "mongoose"
import dotenv from "dotenv"
import User from "../models/User.js"
import Dashboard from "../models/Dashboard.js"
import DataSource from "../models/DataSource.js"

dotenv.config()

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("📦 Connected to MongoDB")

    // Clear existing data
    await User.deleteMany({})
    await Dashboard.deleteMany({})
    await DataSource.deleteMany({})
    console.log("🧹 Cleared existing data")

    // Create users
    const users = await User.create([
      {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        role: "admin",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
      },
      {
        name: "Jane Smith",
        email: "jane@example.com",
        password: "password123",
        role: "editor",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jane",
      },
      {
        name: "Bob Wilson",
        email: "bob@example.com",
        password: "password123",
        role: "viewer",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=bob",
      },
    ])

    console.log("👥 Created users")

    // Create data sources
    const dataSources = await DataSource.create([
      {
        name: "Sales API",
        type: "api",
        config: {
          url: "https://api.example.com/sales",
          method: "GET",
          headers: { Authorization: "Bearer dummy-token" },
        },
        owner: users[0]._id,
      },
      {
        name: "User Database",
        type: "database",
        config: {
          host: "localhost",
          port: 5432,
          database: "users_db",
          username: "admin",
          password: "dummy-password",
        },
        owner: users[0]._id,
      },
      {
        name: "Mock Analytics",
        type: "mock",
        config: {
          dataType: "analytics",
          recordCount: 1000,
        },
        owner: users[1]._id,
      },
    ])

    console.log("📊 Created data sources")

    // Create dashboards
    const dashboards = await Dashboard.create([
      {
        title: "Sales Dashboard",
        description: "Real-time sales metrics and KPIs",
        owner: users[0]._id,
        collaborators: [
          { user: users[1]._id, role: "editor" },
          { user: users[2]._id, role: "viewer" },
        ],
        layoutSchema: {
          components: [
            {
              id: "chart-1",
              type: "line-chart",
              position: { x: 0, y: 0, w: 6, h: 4 },
              props: {
                title: "Monthly Sales",
                dataSource: dataSources[0]._id,
              },
            },
            {
              id: "metric-1",
              type: "metric-card",
              position: { x: 6, y: 0, w: 3, h: 2 },
              props: {
                title: "Total Revenue",
                value: "$125,000",
                trend: "+12%",
              },
            },
            {
              id: "table-1",
              type: "data-table",
              position: { x: 0, y: 4, w: 12, h: 6 },
              props: {
                title: "Recent Orders",
                dataSource: dataSources[0]._id,
              },
            },
          ],
          layout: { rows: 12, cols: 12 },
          theme: "light",
        },
        dataSources: [dataSources[0]._id],
        tags: ["sales", "revenue", "kpi"],
        lastModifiedBy: users[0]._id,
      },
      {
        title: "User Analytics",
        description: "User engagement and behavior analytics",
        owner: users[1]._id,
        collaborators: [{ user: users[0]._id, role: "editor" }],
        layoutSchema: {
          components: [
            {
              id: "chart-2",
              type: "bar-chart",
              position: { x: 0, y: 0, w: 8, h: 5 },
              props: {
                title: "User Signups by Month",
                dataSource: dataSources[1]._id,
              },
            },
            {
              id: "pie-1",
              type: "pie-chart",
              position: { x: 8, y: 0, w: 4, h: 5 },
              props: {
                title: "User Segments",
                dataSource: dataSources[2]._id,
              },
            },
          ],
          layout: { rows: 12, cols: 12 },
          theme: "dark",
        },
        dataSources: [dataSources[1]._id, dataSources[2]._id],
        tags: ["users", "analytics", "engagement"],
        isPublic: true,
        lastModifiedBy: users[1]._id,
      },
      {
        title: "Marketing Dashboard",
        description: "Campaign performance and lead tracking",
        owner: users[0]._id,
        layoutSchema: {
          components: [
            {
              id: "metric-2",
              type: "metric-card",
              position: { x: 0, y: 0, w: 3, h: 2 },
              props: {
                title: "Conversion Rate",
                value: "3.2%",
                trend: "+0.5%",
              },
            },
            {
              id: "metric-3",
              type: "metric-card",
              position: { x: 3, y: 0, w: 3, h: 2 },
              props: {
                title: "Cost per Lead",
                value: "$45",
                trend: "-$5",
              },
            },
          ],
          layout: { rows: 12, cols: 12 },
          theme: "light",
        },
        tags: ["marketing", "campaigns", "leads"],
        lastModifiedBy: users[0]._id,
      },
    ])

    console.log("📈 Created dashboards")

    console.log("\n🎉 Seed data created successfully!")
    console.log("\n👥 Test Users:")
    console.log("Admin: john@example.com / password123")
    console.log("Editor: jane@example.com / password123")
    console.log("Viewer: bob@example.com / password123")

    process.exit(0)
  } catch (error) {
    console.error("❌ Error seeding data:", error)
    process.exit(1)
  }
}

seedData()
