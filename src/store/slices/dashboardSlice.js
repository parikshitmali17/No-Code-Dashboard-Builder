import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { dashboardAPI } from "../../services/api"

// Async thunks
export const getDashboards = createAsyncThunk("dashboard/getDashboards", async (params = {}, { rejectWithValue }) => {
  try {
    const response = await dashboardAPI.getDashboards(params)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch dashboards")
  }
})

export const getDashboard = createAsyncThunk("dashboard/getDashboard", async (id, { rejectWithValue }) => {
  try {
    const response = await dashboardAPI.getDashboard(id)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch dashboard")
  }
})

export const createDashboard = createAsyncThunk("dashboard/createDashboard", async (data, { rejectWithValue }) => {
  try {
    const response = await dashboardAPI.createDashboard(data)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to create dashboard")
  }
})

export const updateDashboard = createAsyncThunk(
  "dashboard/updateDashboard",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await dashboardAPI.updateDashboard(id, data)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update dashboard")
    }
  },
)

export const deleteDashboard = createAsyncThunk("dashboard/deleteDashboard", async (id, { rejectWithValue }) => {
  try {
    await dashboardAPI.deleteDashboard(id)
    return id
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to delete dashboard")
  }
})

const initialState = {
  dashboards: [],
  currentDashboard: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
}

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentDashboard: (state, action) => {
      state.currentDashboard = action.payload
    },
    clearCurrentDashboard: (state) => {
      state.currentDashboard = null
    },
    updateCurrentDashboard: (state, action) => {
      if (state.currentDashboard) {
        state.currentDashboard = { ...state.currentDashboard, ...action.payload }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Get dashboards
      .addCase(getDashboards.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getDashboards.fulfilled, (state, action) => {
        state.loading = false
        state.dashboards = action.payload.dashboards
        state.pagination = action.payload.pagination
      })
      .addCase(getDashboards.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Get single dashboard
      .addCase(getDashboard.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getDashboard.fulfilled, (state, action) => {
        state.loading = false
        state.currentDashboard = action.payload.dashboard
      })
      .addCase(getDashboard.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Create dashboard
      .addCase(createDashboard.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createDashboard.fulfilled, (state, action) => {
        state.loading = false
        state.dashboards.unshift(action.payload.dashboard)
      })
      .addCase(createDashboard.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update dashboard
      .addCase(updateDashboard.fulfilled, (state, action) => {
        const index = state.dashboards.findIndex((d) => d._id === action.payload.dashboard._id)
        if (index !== -1) {
          state.dashboards[index] = action.payload.dashboard
        }
        if (state.currentDashboard?._id === action.payload.dashboard._id) {
          state.currentDashboard = action.payload.dashboard
        }
      })
      // Delete dashboard
      .addCase(deleteDashboard.fulfilled, (state, action) => {
        state.dashboards = state.dashboards.filter((d) => d._id !== action.payload)
        if (state.currentDashboard?._id === action.payload) {
          state.currentDashboard = null
        }
      })
  },
})

export const { clearError, setCurrentDashboard, clearCurrentDashboard, updateCurrentDashboard } = dashboardSlice.actions
export default dashboardSlice.reducer
