// import axios from "axios"

// const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

// // Create axios instance
// const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     "Content-Type": "application/json",
//   },
// })

// // Request interceptor to add auth token
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("token")
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`
//     }
//     return config
//   },
//   (error) => {
//     return Promise.reject(error)
//   },
// )

// // Response interceptor for error handling
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem("token")
//       window.location.href = "/login"
//     }
//     return Promise.reject(error)
//   },
// )

// // Auth API
// export const authAPI = {
//   login: (email, password) => api.post("/api/auth/login", { email, password }),
//   signup: (name, email, password, role = "editor") => api.post("/auth/signup", { name, email, password, role }),
//   getCurrentUser: () => api.get("/auth/me"),
//   googleLogin: (googleData) => api.post("/auth/google", googleData),
// }

// // Dashboard API
// export const dashboardAPI = {
//   getDashboards: (params = {}) => api.get("/api/dashboards", { params }),
//   getDashboard: (id) => api.get(`/dashboards/${id}`),
//   createDashboard: (data) => api.post("/dashboards", data),
//   updateDashboard: (id, data) => api.put(`/dashboards/${id}`, data),
//   deleteDashboard: (id) => api.delete(`/dashboards/${id}`),
//   addCollaborator: (id, data) => api.post(`/dashboards/${id}/collaborators`, data),
// }

// // Data Source API
// export const dataSourceAPI = {
//   getDataSources: () => api.get("/datasources"),
//   createDataSource: (data) => api.post("/datasources", data),
//   testDataSource: (id) => api.post(`/datasources/${id}/test`),
// }

// export default api



// import axios from "axios"

// // Explicitly set the full API URL with /api prefix
// const API_BASE_URL = "http://localhost:5000/api"

// // Create axios instance
// const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     "Content-Type": "application/json",
//   },
// })

// // Request interceptor to add auth token
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("token")
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`
//     }
//     return config
//   },
//   (error) => {
//     return Promise.reject(error)
//   },
// )

// // Response interceptor for error handling
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem("token")
//       window.location.href = "/login"
//     }
//     return Promise.reject(error)
//   },
// )

// // Auth API
// export const authAPI = {
//   login: (email, password) => api.post("/auth/login", { email, password }),
//   signup: (name, email, password, role = "editor") => api.post("/auth/signup", { name, email, password, role }),
//   getCurrentUser: () => api.get("/auth/me"),
//   googleLogin: (googleData) => api.post("/auth/google", googleData),
// }

// // Dashboard API
// export const dashboardAPI = {
//   getDashboards: (params = {}) => api.get("/dashboards", { params }),
//   getDashboard: (id) => api.get(`/dashboards/${id}`),
//   createDashboard: (data) => api.post("/dashboards", data),
//   updateDashboard: (id, data) => api.put(`/dashboards/${id}`, data),
//   deleteDashboard: (id) => api.delete(`/dashboards/${id}`),
//   addCollaborator: (id, data) => api.post(`/dashboards/${id}/collaborators`, data),
// }

// // Data Source API
// export const dataSourceAPI = {
//   getDataSources: () => api.get("/datasources"),
//   createDataSource: (data) => api.post("/datasources", data),
//   testDataSource: (id) => api.post(`/datasources/${id}/test`),
// }

// export default api


import axios from "axios"

const API_BASE_URL = "http://localhost:5000/api"

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't automatically redirect here, let the component handle it
      localStorage.removeItem("token")
    }
    return Promise.reject(error)
  },
)

// Auth API
export const authAPI = {
  login: (email, password) => api.post("/auth/login", { email, password }),
  signup: (name, email, password, role = "editor") => api.post("/auth/signup", { name, email, password, role }),
  getCurrentUser: () => api.get("/auth/me"),
  googleLogin: (googleData) => api.post("/auth/google", googleData),
}

// Dashboard API
export const dashboardAPI = {
  getDashboards: (params = {}) => api.get("/dashboards", { params }),
  getDashboard: (id) => api.get(`/dashboards/${id}`),
  createDashboard: (data) =>{ 
     console.log("Creating dashboard with token:", localStorage.getItem("token"))
    api.post("/dashboards", data)},
  updateDashboard: (id, data) => api.put(`/dashboards/${id}`, data),
  deleteDashboard: (id) => api.delete(`/dashboards/${id}`),
  addCollaborator: (id, data) => api.post(`/dashboards/${id}/collaborators`, data),
}

// Data Source API
export const dataSourceAPI = {
  getDataSources: () => api.get("/datasources"),
  createDataSource: (data) => api.post("/datasources", data),
  testDataSource: (id) => api.post(`/datasources/${id}/test`),
}

export default api
