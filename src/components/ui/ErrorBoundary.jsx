"use client"
import React from "react"
import { AlertTriangle } from "lucide-react"

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error("Widget Error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full bg-red-50 border-2 border-red-200 rounded-lg flex items-center justify-center p-4">
          <div className="text-center">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-600 font-medium mb-1">Widget Error</p>
            <p className="text-red-500 text-sm">{this.state.error?.message || "Something went wrong"}</p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
