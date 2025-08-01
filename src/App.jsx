// "use client"
// import { Routes, Route, Navigate } from "react-router-dom"
// import { useSelector } from "react-redux"
// import { motion, AnimatePresence } from "framer-motion"
// import { DndProvider } from "react-dnd"
// import { HTML5Backend } from "react-dnd-html5-backend"

// // Pages
// import LandingPage from "./pages/LandingPage"
// import LoginPage from "./pages/LoginPage"
// import SignupPage from "./pages/SignupPage"
// import DashboardList from "./pages/DashboardList"
// import DashboardBuilder from "./pages/DashboardBuilder"

// import { useEffect } from "react"
// import { useDispatch } from "react-redux"
// import { getCurrentUser } from "./store/slices/authSlice"

// // Components
// import ProtectedRoute from "./components/auth/ProtectedRoute"
// import LoadingSpinner from "./components/ui/LoadingSpinner"

// function App() {
//   const dispatch = useDispatch()

//   // useEffect(() => {
//   //   dispatch(getCurrentUser()) // This will auto-handle token from localStorage
//   // }, [])

//   useEffect(() => {
//   const token = localStorage.getItem("token")
//   if (token) {
//     dispatch(getCurrentUser())
//   }
// }, [])

//   const { isAuthenticated, loading } = useSelector((state) => state.auth)

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
//         <LoadingSpinner size="lg" />
//       </div>
//     )
//   }

//   return (
//     <DndProvider backend={HTML5Backend}>
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
//         <AnimatePresence mode="wait">
//           <Routes>
//             {/* Public Routes */}
//             <Route
//               path="/"
//               element={
//                 isAuthenticated ? (
//                   <Navigate to="/dashboards" replace />
//                 ) : (
//                   <motion.div
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     exit={{ opacity: 0 }}
//                     transition={{ duration: 0.3 }}
//                   >
//                     <LandingPage />
//                   </motion.div>
//                 )
//               }
//             />
//             <Route
//               path="/login"
//               element={
//                 isAuthenticated ? (
//                   <Navigate to="/dashboards" replace />
//                 ) : (
//                   <motion.div
//                     initial={{ x: -20, opacity: 0 }}
//                     animate={{ x: 0, opacity: 1 }}
//                     exit={{ x: 20, opacity: 0 }}
//                     transition={{ duration: 0.3 }}
//                   >
//                     <LoginPage />
//                   </motion.div>
//                 )
//               }
//             />
//             <Route
//               path="/signup"
//               element={
//                 isAuthenticated ? (
//                   <Navigate to="/dashboards" replace />
//                 ) : (
//                   <motion.div
//                     initial={{ x: 20, opacity: 0 }}
//                     animate={{ x: 0, opacity: 1 }}
//                     exit={{ x: -20, opacity: 0 }}
//                     transition={{ duration: 0.3 }}
//                   >
//                     <SignupPage />
//                   </motion.div>
//                 )
//               }
//             />

//             {/* Protected Routes */}
//             <Route
//               path="/dashboards"
//               element={
//                 <ProtectedRoute>
//                   <motion.div
//                     initial={{ y: 20, opacity: 0 }}
//                     animate={{ y: 0, opacity: 1 }}
//                     exit={{ y: -20, opacity: 0 }}
//                     transition={{ duration: 0.3 }}
//                   >
//                     <DashboardList />
//                   </motion.div>
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/dashboard/:id"
//               element={
//                 <ProtectedRoute>
//                   <motion.div
//                     initial={{ scale: 0.95, opacity: 0 }}
//                     animate={{ scale: 1, opacity: 1 }}
//                     exit={{ scale: 1.05, opacity: 0 }}
//                     transition={{ duration: 0.3 }}
//                   >
//                     <DashboardBuilder />
//                   </motion.div>
//                 </ProtectedRoute>
//               }
//             />

//             {/* Catch all */}
//             <Route path="*" element={<Navigate to="/" replace />} />
//           </Routes>
//         </AnimatePresence>
//       </div>
//     </DndProvider>
//   )
// }

// export default App


"use client"
import { Routes, Route, Navigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { useEffect } from "react"
import { getCurrentUser } from "./store/slices/authSlice"

// Pages
import LandingPage from "./pages/LandingPage"
import LoginPage from "./pages/LoginPage"
import SignupPage from "./pages/SignupPage"
import DashboardList from "./pages/DashboardList"
import DashboardBuilder from "./pages/DashboardBuilder"

// Components
import ProtectedRoute from "./components/auth/ProtectedRoute"
import LoadingSpinner from "./components/ui/LoadingSpinner"

function App() {
  const dispatch = useDispatch()
  const { isAuthenticated, loading, token } = useSelector((state) => state.auth)

  useEffect(() => {
    // Only try to get current user if we have a token but aren't authenticated
    if (token && !isAuthenticated && !loading) {
      dispatch(getCurrentUser())
    }
  }, [dispatch, token, isAuthenticated, loading])

  // Show loading spinner while checking authentication
  if (token && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <AnimatePresence mode="wait">
          <Routes>
            {/* Public Routes */}
            <Route
              path="/"
              element={
                isAuthenticated ? (
                  <Navigate to="/dashboards" replace />
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <LandingPage />
                  </motion.div>
                )
              }
            />
            <Route
              path="/login"
              element={
                isAuthenticated ? (
                  <Navigate to="/dashboards" replace />
                ) : (
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 20, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <LoginPage />
                  </motion.div>
                )
              }
            />
            <Route
              path="/signup"
              element={
                isAuthenticated ? (
                  <Navigate to="/dashboards" replace />
                ) : (
                  <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <SignupPage />
                  </motion.div>
                )
              }
            />

            {/* Protected Routes */}
            <Route
              path="/dashboards"
              element={
                <ProtectedRoute>
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <DashboardList />
                  </motion.div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/:id"
              element={
                <ProtectedRoute>
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.05, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <DashboardBuilder />
                  </motion.div>
                </ProtectedRoute>
              }
            />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </div>
    </DndProvider>
  )
}

export default App
