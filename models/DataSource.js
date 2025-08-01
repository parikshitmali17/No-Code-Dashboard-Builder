import mongoose from "mongoose"

const dataSourceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["api", "database", "file", "mock"],
      required: true,
    },
    config: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastTested: Date,
    testResult: {
      success: Boolean,
      message: String,
      timestamp: Date,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.model("DataSource", dataSourceSchema)
