"use client"
import { motion } from "framer-motion"
import { useDrag } from "react-dnd"
import { getWidgetCategories } from "../widgets/componentRegistry"
import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"

const DraggableWidget = ({ type, config }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "widget",
    item: { type, config },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }))

  const IconComponent = config.icon

  return (
    <motion.div
      ref={drag}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        p-3 bg-white border border-gray-200 rounded-lg cursor-move hover:shadow-md transition-all duration-200
        ${isDragging ? "opacity-50" : ""}
      `}
    >
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gray-50 rounded-lg">
          <IconComponent className="w-5 h-5 text-gray-600" />
        </div>
        <div>
          <p className="font-medium text-gray-900 text-sm">{config.name}</p>
          <p className="text-xs text-gray-500">{config.category}</p>
        </div>
      </div>
    </motion.div>
  )
}

const WidgetSidebar = () => {
  const [expandedCategories, setExpandedCategories] = useState(new Set(["Charts", "Metrics"]))
  const categories = getWidgetCategories()

  const toggleCategory = (category) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  return (
    <div className="w-80 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Widgets</h2>
        <p className="text-sm text-gray-600">Drag widgets to your dashboard</p>
      </div>

      <div className="space-y-4">
        {Object.entries(categories).map(([category, widgets]) => (
          <div key={category}>
            <button
              onClick={() => toggleCategory(category)}
              className="flex items-center justify-between w-full p-2 text-left hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span className="font-medium text-gray-900">{category}</span>
              {expandedCategories.has(category) ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
            </button>

            {expandedCategories.has(category) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 space-y-2 pl-2"
              >
                {widgets.map((widget) => (
                  <DraggableWidget key={widget.type} type={widget.type} config={widget} />
                ))}
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default WidgetSidebar
