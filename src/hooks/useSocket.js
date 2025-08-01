"use client"
import { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import socketService from "../services/socketService"

export const useSocket = () => {
  const dispatch = useDispatch()
  const { token, user } = useSelector((state) => state.auth)
  const { isConnected } = useSelector((state) => state.collaboration)

  useEffect(() => {
    if (token && user && !isConnected) {
      socketService.connect(token)
    }

    return () => {
      if (isConnected) {
        socketService.disconnect()
      }
    }
  }, [token, user, isConnected])

  return {
    isConnected,
    joinDashboard: socketService.joinDashboard.bind(socketService),
    leaveDashboard: socketService.leaveDashboard.bind(socketService),
    updateCanvas: socketService.updateCanvas.bind(socketService),
    moveCursor: socketService.moveCursor.bind(socketService),
    lockComponent: socketService.lockComponent.bind(socketService),
    unlockComponent: socketService.unlockComponent.bind(socketService),
    saveDashboard: socketService.saveDashboard.bind(socketService),
  }
}
