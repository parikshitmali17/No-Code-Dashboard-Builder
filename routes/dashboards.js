import express from "express"
import Joi from "joi"
import Dashboard from "../models/Dashboard.js"
import { protect } from "../middleware/auth.js"

const router = express.Router()

// Validation schemas
const createDashboardSchema = Joi.object({
  title: Joi.string().min(1).max(100).required(),
  description: Joi.string().max(500).default(""),
  layoutSchema: Joi.object().default({
    components: [],
    layout: { rows: 12, cols: 12 },
    theme: "light",
  }),
  isPublic: Joi.boolean().default(false),
  tags: Joi.array().items(Joi.string()).default([]),
})

const updateDashboardSchema = Joi.object({
  title: Joi.string().min(1).max(100),
  description: Joi.string().max(500),
  layoutSchema: Joi.object(),
  isPublic: Joi.boolean(),
  tags: Joi.array().items(Joi.string()),
})

// @desc    Get all dashboards for user
// @route   GET /api/dashboards
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query

    const query = {
      $or: [{ owner: req.user._id }, { "collaborators.user": req.user._id }, { isPublic: true }],
    }

    if (search) {
      query.$and = [
        query,
        {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
            { tags: { $in: [new RegExp(search, "i")] } },
          ],
        },
      ]
    }

    const dashboards = await Dashboard.find(query)
      .populate("owner", "name email avatar")
      .populate("collaborators.user", "name email avatar")
      .populate("lastModifiedBy", "name email")
      .sort({ lastModified: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Dashboard.countDocuments(query)

    res.json({
      success: true,
      data: {
        dashboards,
        pagination: {
          page: Number.parseInt(page),
          limit: Number.parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching dashboards",
    })
  }
})

// @desc    Get single dashboard
// @route   GET /api/dashboards/:id
// @access  Private
router.get("/:id", protect, async (req, res) => {
  try {
    const dashboard = await Dashboard.findById(req.params.id)
      .populate("owner", "name email avatar")
      .populate("collaborators.user", "name email avatar")
      .populate("dataSources")

    if (!dashboard) {
      return res.status(404).json({
        success: false,
        message: "Dashboard not found",
      })
    }

    // Check access permissions
    const hasAccess =
      dashboard.owner._id.toString() === req.user._id.toString() ||
      dashboard.collaborators.some((collab) => collab.user._id.toString() === req.user._id.toString()) ||
      dashboard.isPublic

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      })
    }

    res.json({
      success: true,
      data: { dashboard },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard",
    })
  }
})

// @desc    Create new dashboard
// @route   POST /api/dashboards
// @access  Private
router.post("/", protect, async (req, res) => {
  try {
    const { error, value } = createDashboardSchema.validate(req.body)
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      })
    }

    const dashboard = await Dashboard.create({
      ...value,
      owner: req.user._id,
      lastModifiedBy: req.user._id,
    })

    await dashboard.populate("owner", "name email avatar")

    res.status(201).json({
      success: true,
      message: "Dashboard created successfully",
      data: { dashboard },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating dashboard",
    })
  }
})

// @desc    Update dashboard
// @route   PUT /api/dashboards/:id
// @access  Private
router.put("/:id", protect, async (req, res) => {
  try {
    const { error, value } = updateDashboardSchema.validate(req.body)
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      })
    }

    const dashboard = await Dashboard.findById(req.params.id)

    if (!dashboard) {
      return res.status(404).json({
        success: false,
        message: "Dashboard not found",
      })
    }

    // Check edit permissions
    const canEdit =
      dashboard.owner.toString() === req.user._id.toString() ||
      dashboard.collaborators.some(
        (collab) => collab.user.toString() === req.user._id.toString() && collab.role === "editor",
      )

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Editor permissions required.",
      })
    }

    const updatedDashboard = await Dashboard.findByIdAndUpdate(
      req.params.id,
      {
        ...value,
        lastModifiedBy: req.user._id,
        version: dashboard.version + 1,
      },
      { new: true, runValidators: true },
    )
      .populate("owner", "name email avatar")
      .populate("collaborators.user", "name email avatar")

    res.json({
      success: true,
      message: "Dashboard updated successfully",
      data: { dashboard: updatedDashboard },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating dashboard",
    })
  }
})

// @desc    Delete dashboard
// @route   DELETE /api/dashboards/:id
// @access  Private
router.delete("/:id", protect, async (req, res) => {
  try {
    const dashboard = await Dashboard.findById(req.params.id)

    if (!dashboard) {
      return res.status(404).json({
        success: false,
        message: "Dashboard not found",
      })
    }

    // Only owner can delete
    if (dashboard.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only owner can delete dashboard.",
      })
    }

    await Dashboard.findByIdAndDelete(req.params.id)

    res.json({
      success: true,
      message: "Dashboard deleted successfully",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting dashboard",
    })
  }
})

// @desc    Add collaborator to dashboard
// @route   POST /api/dashboards/:id/collaborators
// @access  Private
router.post("/:id/collaborators", protect, async (req, res) => {
  try {
    const { email, role = "viewer" } = req.body

    const dashboard = await Dashboard.findById(req.params.id)
    if (!dashboard) {
      return res.status(404).json({
        success: false,
        message: "Dashboard not found",
      })
    }

    // Only owner can add collaborators
    if (dashboard.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only owner can add collaborators.",
      })
    }

    // Find user by email
    const User = (await import("../models/User.js")).default
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Check if already a collaborator
    const existingCollab = dashboard.collaborators.find((collab) => collab.user.toString() === user._id.toString())

    if (existingCollab) {
      return res.status(400).json({
        success: false,
        message: "User is already a collaborator",
      })
    }

    dashboard.collaborators.push({
      user: user._id,
      role,
    })

    await dashboard.save()
    await dashboard.populate("collaborators.user", "name email avatar")

    res.json({
      success: true,
      message: "Collaborator added successfully",
      data: { dashboard },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding collaborator",
    })
  }
})

export default router
