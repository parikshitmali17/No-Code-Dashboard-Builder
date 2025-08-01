"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { Save, Users, Settings, Undo, Redo, Grid, ZoomIn, ZoomOut, BarChart3, ArrowLeft, Share } from "lucide-react"

// Components
import WidgetSidebar from "../components/builder/WidgetSidebar"
import DashboardCanvas from "../components/builder/DashboardCanvas"
import LoadingSpinner from "../components/ui/LoadingSpinner"
import Button from "../components/ui/Button"

// Store
import { getDashboard, updateDashboard } from "../store/slices/dashboardSlice"
import { loadCanvas, undo, redo, setZoom, toggleSnapToGrid } from "../store/slices/canvasSlice"
import { getCurrentUser } from "../store/slices/authSlice"

// Services
import socketService from "../services/socketService"
import toast from "react-hot-toast"

const DashboardBuilder = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  // Redux state
  const { user, token } = useSelector((state) => state.auth)
  const { currentDashboard, loading } = useSelector((state) => state.dashboard)
  const { components, selectedComponent, zoom, snapToGrid, history } = useSelector((state) => state.canvas)
  const { isConnected, activeUsers, userRole } = useSelector((state) => state.collaboration)

  // Local state
  const [isSaving, setIsSaving] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)

  // Initialize dashboard and socket connection
  useEffect(() => {
    if (!user) {
      dispatch(getCurrentUser())
      return
    }

    if (id && token) {
      // Load dashboard
      dispatch(getDashboard(id))

      // Connect to socket
      socketService.connect(token)
      socketService.joinDashboard(id)

      return () => {
        socketService.leaveDashboard()
      }
    }
  }, [id, token, user, dispatch])

  // Load canvas when dashboard is loaded
  useEffect(() => {
    if (currentDashboard?.layoutSchema) {
      dispatch(loadCanvas(currentDashboard.layoutSchema))
    }
  }, [currentDashboard, dispatch])

  // Auto-save functionality
  useEffect(() => {
    if (!currentDashboard || components.length === 0) return

    const autoSaveTimer = setTimeout(() => {
      handleSave(true) // Auto-save
    }, 30000) // Auto-save every 30 seconds

    return () => clearTimeout(autoSaveTimer)
  }, [components, currentDashboard])

  // Handle cursor movement
  const handleMouseMove = useCallback(
    (e) => {
      if (!isConnected) return

      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      socketService.moveCursor(x, y, selectedComponent)
    },
    [isConnected, selectedComponent],
  )

  // Save dashboard
  const handleSave = async (isAutoSave = false) => {
    if (!currentDashboard || userRole === "viewer") return

    setIsSaving(true)
    try {
      const layoutSchema = {
        components,
        layout: { rows: 12, cols: 12 },
        theme: "light",
      }

      await dispatch(
        updateDashboard({
          id: currentDashboard._id,
          data: { layoutSchema },
        }),
      ).unwrap()

      // Notify other users via socket
      socketService.saveDashboard(layoutSchema, currentDashboard.version)

      setLastSaved(new Date())
      if (!isAutoSave) {
        toast.success("Dashboard saved successfully!")
      }
    } catch (error) {
      toast.error("Failed to save dashboard")
    } finally {
      setIsSaving(false)
    }
  }

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "s":
            e.preventDefault()
            handleSave()
            break
          case "z":
            e.preventDefault()
            if (e.shiftKey) {
              dispatch(redo())
            } else {
              dispatch(undo())
            }
            break
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [dispatch])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!currentDashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard not found</h2>
          <p className="text-gray-600 mb-4">The dashboard you're looking for doesn't exist or you don't have access.</p>
          <Button onClick={() => navigate("/dashboards")}>Back to Dashboards</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate("/dashboards")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">{currentDashboard.title}</h1>
            </div>
            {lastSaved && <span className="text-sm text-gray-500">Last saved: {lastSaved.toLocaleTimeString()}</span>}
          </div>

          <div className="flex items-center space-x-2">
            {/* Connection status */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
              <span className="text-sm text-gray-600">{isConnected ? "Connected" : "Disconnected"}</span>
            </div>

            {/* Active users */}
            {activeUsers.length > 0 && (
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">{activeUsers.length}</span>
                <div className="flex -space-x-2">
                  {activeUsers.slice(0, 3).map((user) => (
                    <div
                      key={user.id}
                      className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-white"
                      title={user.name}
                    >
                      {user.name.charAt(0)}
                    </div>
                  ))}
                  {activeUsers.length > 3 && (
                    <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-white">
                      +{activeUsers.length - 3}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Toolbar */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <Button variant="ghost" size="sm" onClick={() => dispatch(undo())} disabled={history.past.length === 0}>
                <Undo className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => dispatch(redo())} disabled={history.future.length === 0}>
                <Redo className="w-4 h-4" />
              </Button>
              <div className="w-px h-6 bg-gray-300 mx-1" />
              <Button variant="ghost" size="sm" onClick={() => dispatch(setZoom(Math.max(0.25, zoom - 0.25)))}>
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium min-w-[60px] text-center">{Math.round(zoom * 100)}%</span>
              <Button variant="ghost" size="sm" onClick={() => dispatch(setZoom(Math.min(2, zoom + 0.25)))}>
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch(toggleSnapToGrid())}
                className={snapToGrid ? "bg-blue-100 text-blue-700" : ""}
              >
                <Grid className="w-4 h-4" />
              </Button>
            </div>

            {/* Action buttons */}
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => setShowSettings(true)}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline">
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button onClick={() => handleSave()} loading={isSaving} disabled={userRole === "viewer"}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex" onMouseMove={handleMouseMove}>
        {/* Widget sidebar */}
        <WidgetSidebar />

        {/* Canvas */}
        <DashboardCanvas dashboardId={id} />
      </div>

      {/* User role indicator */}
      {userRole && (
        <div className="absolute top-20 right-4 bg-white rounded-lg shadow-lg border border-gray-200 px-3 py-2">
          <div className="flex items-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full ${
                userRole === "owner" ? "bg-green-500" : userRole === "editor" ? "bg-blue-500" : "bg-gray-500"
              }`}
            />
            <span className="text-sm font-medium capitalize">{userRole}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardBuilder
