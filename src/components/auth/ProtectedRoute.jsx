"use client"

import { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Navigate } from "react-router-dom"
import { getCurrentUser } from "../../store/slices/authSlice"
import LoadingSpinner from "../ui/LoadingSpinner"

const ProtectedRoute = ({ children }) => {
  const dispatch = useDispatch()
  const { isAuthenticated, loading, token } = useSelector((state) => state.auth)

  useEffect(() => {
    if (token && !isAuthenticated && !loading) {
      dispatch(getCurrentUser())
    }
  }, [dispatch, token, isAuthenticated, loading])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute
