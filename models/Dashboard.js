import mongoose from "mongoose"

const dashboardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    collaborators: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        role: {
          type: String,
          enum: ["editor", "viewer"],
          default: "viewer",
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    layoutSchema: {
      type: mongoose.Schema.Types.Mixed,
      default: {
        components: [],
        layout: {
          rows: 12,
          cols: 12,
        },
        theme: "light",
      },
    },
    dataSources: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DataSource",
      },
    ],
    isPublic: {
      type: Boolean,
      default: false,
    },
    tags: [String],
    version: {
      type: Number,
      default: 1,
    },
    lastModified: {
      type: Date,
      default: Date.now,
    },
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
)

// Update lastModified on save
dashboardSchema.pre("save", function (next) {
  this.lastModified = new Date()
  next()
})

export default mongoose.model("Dashboard", dashboardSchema)
