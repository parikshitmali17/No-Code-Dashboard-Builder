"use client"
import { motion } from "framer-motion"
import { clsx } from "clsx"

const LoadingSpinner = ({ size = "md", className }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  }

  return (
    <div className={clsx("flex items-center justify-center", className)}>
      <motion.div
        className={clsx("border-4 border-blue-200 border-t-blue-600 rounded-full", sizeClasses[size])}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      />
    </div>
  )
}

export default LoadingSpinner
