"use client"
import { useCallback, useRef } from "react"
import { useDrop } from "react-dnd"
import { useSelector, useDispatch } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"
import { Rnd } from "react-rnd"
import { addComponent, updateComponent, selectComponent, moveComponent } from "../../store/slices/canvasSlice"
import { createWidgetInstance } from "../widgets/componentRegistry"
import WidgetRenderer from "./WidgetRenderer"
import UserCursor from "./UserCursor"

const DashboardCanvas = ({ dashboardId }) => {
  const dispatch = useDispatch()
  const canvasRef = useRef(null)
  const { components, selectedComponent, zoom, snapToGrid, gridSize } = useSelector((state) => state.canvas)
  const { userCursors, lockedComponents } = useSelector((state) => state.collaboration)

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "widget",
    drop: (item, monitor) => {
      const offset = monitor.getClientOffset()
      const canvasRect = canvasRef.current?.getBoundingClientRect()

      if (offset && canvasRect) {
        const x = Math.max(0, offset.x - canvasRect.left)
        const y = Math.max(0, offset.y - canvasRect.top)

        const gridX = snapToGrid ? Math.round(x / gridSize) * gridSize : x
        const gridY = snapToGrid ? Math.round(y / gridSize) * gridSize : y

        const widget = createWidgetInstance(item.type, { x: gridX, y: gridY })
        if (widget) {
          dispatch(addComponent(widget))
        }
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }))

  const handleWidgetSelect = useCallback(
    (widgetId) => {
      dispatch(selectComponent(widgetId))
    },
    [dispatch],
  )

  const handleWidgetUpdate = useCallback(
    (widgetId, updates) => {
      dispatch(updateComponent({ id: widgetId, updates }))
    },
    [dispatch],
  )

  const handleWidgetMove = useCallback(
    (widgetId, position) => {
      dispatch(moveComponent({ id: widgetId, position }))
    },
    [dispatch],
  )

  // Combine refs for drop functionality
  const setRefs = useCallback(
    (node) => {
      canvasRef.current = node
      drop(node)
    },
    [drop],
  )

  return (
    <div className="flex-1 relative overflow-hidden bg-gray-100">
      {/* Canvas */}
      <div
        ref={setRefs}
        className={`
          relative w-full h-full transition-all duration-200
          ${isOver ? "bg-blue-50" : ""}
        `}
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: "top left",
          backgroundImage: snapToGrid ? `radial-gradient(circle, #d1d5db 1px, transparent 1px)` : "none",
          backgroundSize: snapToGrid ? `${gridSize}px ${gridSize}px` : "auto",
        }}
      >
        {/* Drop zone indicator */}
        {isOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 border-2 border-dashed border-blue-400 bg-blue-50/50 flex items-center justify-center"
          >
            <div className="text-blue-600 font-medium">Drop widget here</div>
          </motion.div>
        )}

        {/* Widgets */}
        <AnimatePresence>
          {components.map((widget) => {
            const isSelected = selectedComponent === widget.id
            const isLocked = lockedComponents[widget.id]

            return (
              <Rnd
                key={widget.id}
                size={{ width: widget.position.w, height: widget.position.h }}
                position={{ x: widget.position.x, y: widget.position.y }}
                onDragStop={(e, d) => {
                  const newX = snapToGrid ? Math.round(d.x / gridSize) * gridSize : d.x
                  const newY = snapToGrid ? Math.round(d.y / gridSize) * gridSize : d.y
                  handleWidgetMove(widget.id, { x: newX, y: newY })
                }}
                onResizeStop={(e, direction, ref, delta, position) => {
                  handleWidgetUpdate(widget.id, {
                    position: {
                      ...widget.position,
                      w: ref.offsetWidth,
                      h: ref.offsetHeight,
                      x: position.x,
                      y: position.y,
                    },
                  })
                }}
                bounds="parent"
                dragGrid={snapToGrid ? [gridSize, gridSize] : [1, 1]}
                resizeGrid={snapToGrid ? [gridSize, gridSize] : [1, 1]}
                disableDragging={isLocked}
                enableResizing={!isLocked}
                className={`
                  ${isSelected ? "z-10" : "z-0"}
                  ${isLocked ? "cursor-not-allowed" : "cursor-move"}
                `}
              >
                <WidgetRenderer
                  widget={widget}
                  isSelected={isSelected}
                  isLocked={isLocked}
                  onSelect={handleWidgetSelect}
                  onUpdate={handleWidgetUpdate}
                />
              </Rnd>
            )
          })}
        </AnimatePresence>

        {/* User cursors */}
        {Object.entries(userCursors).map(([userId, cursorData]) => (
          <UserCursor
            key={userId}
            userId={userId}
            cursor={cursorData.cursor}
            userName={cursorData.userName}
            selection={cursorData.selection}
          />
        ))}
      </div>

      {/* Canvas controls */}
      <div className="absolute bottom-4 right-4 flex items-center space-x-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2">
        <button
          onClick={() => dispatch({ type: "canvas/setZoom", payload: Math.max(0.25, zoom - 0.25) })}
          className="px-3 py-1 text-sm hover:bg-gray-100 rounded"
        >
          -
        </button>
        <span className="text-sm font-medium min-w-[60px] text-center">{Math.round(zoom * 100)}%</span>
        <button
          onClick={() => dispatch({ type: "canvas/setZoom", payload: Math.min(2, zoom + 0.25) })}
          className="px-3 py-1 text-sm hover:bg-gray-100 rounded"
        >
          +
        </button>
        <div className="w-px h-6 bg-gray-300 mx-2" />
        <button
          onClick={() => dispatch({ type: "canvas/toggleSnapToGrid" })}
          className={`px-3 py-1 text-sm rounded ${snapToGrid ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"}`}
        >
          Grid
        </button>
      </div>
    </div>
  )
}

export default DashboardCanvas
