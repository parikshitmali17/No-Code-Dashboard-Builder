"use client"
import { TrendingUp, TrendingDown, DollarSign, Users, Activity, Target } from "lucide-react"
import { motion } from "framer-motion"

const iconMap = {
  "dollar-sign": DollarSign,
  users: Users,
  activity: Activity,
  target: Target,
}

const MetricCard = ({ title, value, change, trend = "up", icon = "dollar-sign", ...props }) => {
  const IconComponent = iconMap[icon] || DollarSign
  const TrendIcon = trend === "up" ? TrendingUp : TrendingDown
  const trendColor = trend === "up" ? "text-green-600" : "text-red-600"
  const trendBg = trend === "up" ? "bg-green-50" : "bg-red-50"

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="w-full h-full bg-white rounded-lg border border-gray-200 p-6 flex flex-col justify-between"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <IconComponent className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        {change && (
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${trendBg}`}>
            <TrendIcon className={`w-4 h-4 ${trendColor}`} />
            <span className={`text-sm font-medium ${trendColor}`}>{change}</span>
          </div>
        )}
      </div>

      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
    </motion.div>
  )
}

export default MetricCard
