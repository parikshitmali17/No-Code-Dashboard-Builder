"use client"
import { memo } from "react"
import { motion } from "framer-motion"
import { getWidgetComponent } from "../widgets/componentRegistry"
import ErrorBoundary from "../ui/ErrorBoundary"

const WidgetRenderer = memo(({ widget, isSelected, isLocked, onSelect, onUpdate, style = {} }) => {
  const WidgetComponent = getWidgetComponent(widget.type)

  if (!WidgetComponent) {
    return (
      <div className="w-full h-full bg-red-50 border-2 border-red-200 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-medium">Unknown Widget</p>
          <p className="text-red-500 text-sm">Type: {widget.type}</p>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className={`
          relative w-full h-full cursor-pointer transition-all duration-200
          ${isSelected ? "ring-2 ring-blue-500 ring-offset-2" : ""}
          ${isLocked ? "ring-2 ring-red-500 ring-offset-2" : ""}
        `}
        style={style}
        onClick={() => onSelect?.(widget.id)}
      >
        {/* Lock indicator */}
        {isLocked && (
          <div className="absolute top-2 right-2 z-10 bg-red-500 text-white text-xs px-2 py-1 rounded">Locked</div>
        )}

        {/* Widget component */}
        <WidgetComponent {...widget.props} />

        {/* Selection overlay */}
        {isSelected && <div className="absolute inset-0 bg-blue-500/10 rounded-lg pointer-events-none" />}
      </motion.div>
    </ErrorBoundary>
  )
})

WidgetRenderer.displayName = "WidgetRenderer"

export default WidgetRenderer
