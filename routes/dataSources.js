import express from "express"
import Joi from "joi"
import DataSource from "../models/DataSource.js"
import { protect } from "../middleware/auth.js"

const router = express.Router()

// Validation schema
const createDataSourceSchema = Joi.object({
  name: Joi.string().min(1).max(50).required(),
  type: Joi.string().valid("api", "database", "file", "mock").required(),
  config: Joi.object().required(),
})

// @desc    Get all data sources for user
// @route   GET /api/datasources
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    const dataSources = await DataSource.find({ owner: req.user._id })
      .populate("owner", "name email")
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      data: { dataSources },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching data sources",
    })
  }
})

// @desc    Create new data source
// @route   POST /api/datasources
// @access  Private
router.post("/", protect, async (req, res) => {
  try {
    const { error, value } = createDataSourceSchema.validate(req.body)
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      })
    }

    const dataSource = await DataSource.create({
      ...value,
      owner: req.user._id,
    })

    await dataSource.populate("owner", "name email")

    res.status(201).json({
      success: true,
      message: "Data source created successfully",
      data: { dataSource },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating data source",
    })
  }
})

// @desc    Test data source connection
// @route   POST /api/datasources/:id/test
// @access  Private
router.post("/:id/test", protect, async (req, res) => {
  try {
    const dataSource = await DataSource.findOne({
      _id: req.params.id,
      owner: req.user._id,
    })

    if (!dataSource) {
      return res.status(404).json({
        success: false,
        message: "Data source not found",
      })
    }

    // Mock test implementation
    const testResult = {
      success: true,
      message: "Connection successful",
      timestamp: new Date(),
      sampleData: generateMockData(dataSource.type),
    }

    dataSource.lastTested = new Date()
    dataSource.testResult = testResult
    await dataSource.save()

    res.json({
      success: true,
      message: "Data source tested successfully",
      data: { testResult },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error testing data source",
    })
  }
})

// Helper function to generate mock data
function generateMockData(type) {
  const mockData = {
    api: [
      { id: 1, name: "Sample API Data", value: 100, date: "2024-01-01" },
      { id: 2, name: "Another Record", value: 200, date: "2024-01-02" },
    ],
    database: [
      { user_id: 1, username: "john_doe", email: "john@example.com", created_at: "2024-01-01" },
      { user_id: 2, username: "jane_smith", email: "jane@example.com", created_at: "2024-01-02" },
    ],
    file: [
      { column1: "Value 1", column2: "Value 2", column3: 123 },
      { column1: "Value 3", column2: "Value 4", column3: 456 },
    ],
    mock: [
      { category: "Sales", amount: 15000, month: "January" },
      { category: "Marketing", amount: 8000, month: "January" },
      { category: "Sales", amount: 18000, month: "February" },
    ],
  }

  return mockData[type] || []
}

export default router
