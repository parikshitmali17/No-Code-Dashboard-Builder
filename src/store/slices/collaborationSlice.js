import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  socket: null,
  isConnected: false,
  activeUsers: [],
  userCursors: {},
  lockedComponents: {},
  typingUsers: [],
  roomId: null,
  userRole: "viewer", // viewer, editor, owner
}

const collaborationSlice = createSlice({
  name: "collaboration",
  initialState,
  reducers: {
    setSocket: (state, action) => {
      state.socket = action.payload
    },

    setConnected: (state, action) => {
      state.isConnected = action.payload
    },

    setRoomId: (state, action) => {
      state.roomId = action.payload
    },

    setUserRole: (state, action) => {
      state.userRole = action.payload
    },

    // User presence
    setActiveUsers: (state, action) => {
      state.activeUsers = action.payload
    },

    addActiveUser: (state, action) => {
      const user = action.payload
      if (!state.activeUsers.find((u) => u.id === user.id)) {
        state.activeUsers.push(user)
      }
    },

    removeActiveUser: (state, action) => {
      const userId = action.payload
      state.activeUsers = state.activeUsers.filter((u) => u.id !== userId)
      delete state.userCursors[userId]
      delete state.typingUsers[userId]
    },

    // Cursor tracking
    updateUserCursor: (state, action) => {
      const { userId, cursor, selection } = action.payload
      state.userCursors[userId] = {
        ...state.userCursors[userId],
        cursor,
        selection,
        lastUpdate: Date.now(),
      }
    },

    removeUserCursor: (state, action) => {
      const userId = action.payload
      delete state.userCursors[userId]
    },

    // Component locking
    lockComponent: (state, action) => {
      const { componentId, lockedBy } = action.payload
      state.lockedComponents[componentId] = {
        lockedBy,
        timestamp: Date.now(),
      }
    },

    unlockComponent: (state, action) => {
      const componentId = action.payload
      delete state.lockedComponents[componentId]
    },

    unlockAllComponents: (state, action) => {
      const userId = action.payload
      Object.keys(state.lockedComponents).forEach((componentId) => {
        if (state.lockedComponents[componentId].lockedBy.id === userId) {
          delete state.lockedComponents[componentId]
        }
      })
    },

    // Typing indicators
    setUserTyping: (state, action) => {
      const { userId, userName, isTyping } = action.payload
      if (isTyping) {
        if (!state.typingUsers.find((u) => u.id === userId)) {
          state.typingUsers.push({ id: userId, name: userName })
        }
      } else {
        state.typingUsers = state.typingUsers.filter((u) => u.id !== userId)
      }
    },

    // Reset state
    resetCollaboration: (state) => {
      state.activeUsers = []
      state.userCursors = {}
      state.lockedComponents = {}
      state.typingUsers = []
      state.roomId = null
      state.userRole = "viewer"
    },
  },
})

export const {
  setSocket,
  setConnected,
  setRoomId,
  setUserRole,
  setActiveUsers,
  addActiveUser,
  removeActiveUser,
  updateUserCursor,
  removeUserCursor,
  lockComponent,
  unlockComponent,
  unlockAllComponents,
  setUserTyping,
  resetCollaboration,
} = collaborationSlice.actions

export default collaborationSlice.reducer
