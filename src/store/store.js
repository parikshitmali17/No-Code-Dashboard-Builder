import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./slices/authSlice"
import dashboardReducer from "./slices/dashboardSlice"
import canvasReducer from "./slices/canvasSlice"
import collaborationReducer from "./slices/collaborationSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    canvas: canvasReducer,
    collaboration: collaborationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["collaboration/setSocket"],
        ignoredPaths: ["collaboration.socket"],
      },
    }),
})
