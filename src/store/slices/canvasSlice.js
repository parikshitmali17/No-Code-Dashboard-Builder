import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  components: [],
  selectedComponent: null,
  draggedComponent: null,
  layout: {
    rows: 12,
    cols: 12,
  },
  theme: "light",
  zoom: 1,
  gridSize: 20,
  snapToGrid: true,
  history: {
    past: [],
    present: null,
    future: [],
  },
}

const canvasSlice = createSlice({
  name: "canvas",
  initialState,
  reducers: {
    // Component management
    addComponent: (state, action) => {
      const newComponent = {
        id: `component-${Date.now()}`,
        type: action.payload.type,
        position: action.payload.position || { x: 0, y: 0, w: 4, h: 3 },
        props: action.payload.props || {},
        style: action.payload.style || {},
        locked: false,
        visible: true,
      }
      state.components.push(newComponent)
      state.selectedComponent = newComponent.id

      // Add to history
      state.history.past.push({
        type: "ADD_COMPONENT",
        component: newComponent,
      })
    },

    updateComponent: (state, action) => {
      const { id, updates } = action.payload
      const componentIndex = state.components.findIndex((c) => c.id === id)

      if (componentIndex !== -1) {
        const oldComponent = { ...state.components[componentIndex] }
        state.components[componentIndex] = { ...oldComponent, ...updates }

        // Add to history
        state.history.past.push({
          type: "UPDATE_COMPONENT",
          id,
          oldComponent,
          newComponent: state.components[componentIndex],
        })
      }
    },

    deleteComponent: (state, action) => {
      const id = action.payload
      const componentIndex = state.components.findIndex((c) => c.id === id)

      if (componentIndex !== -1) {
        const deletedComponent = state.components[componentIndex]
        state.components.splice(componentIndex, 1)

        if (state.selectedComponent === id) {
          state.selectedComponent = null
        }

        // Add to history
        state.history.past.push({
          type: "DELETE_COMPONENT",
          component: deletedComponent,
          index: componentIndex,
        })
      }
    },

    moveComponent: (state, action) => {
      const { id, position } = action.payload
      const component = state.components.find((c) => c.id === id)

      if (component) {
        const oldPosition = { ...component.position }
        component.position = { ...component.position, ...position }

        // Add to history
        state.history.past.push({
          type: "MOVE_COMPONENT",
          id,
          oldPosition,
          newPosition: component.position,
        })
      }
    },

    // Selection
    selectComponent: (state, action) => {
      state.selectedComponent = action.payload
    },

    clearSelection: (state) => {
      state.selectedComponent = null
    },

    // Drag and drop
    setDraggedComponent: (state, action) => {
      state.draggedComponent = action.payload
    },

    // Layout
    updateLayout: (state, action) => {
      state.layout = { ...state.layout, ...action.payload }
    },

    setTheme: (state, action) => {
      state.theme = action.payload
    },

    setZoom: (state, action) => {
      state.zoom = Math.max(0.25, Math.min(2, action.payload))
    },

    toggleSnapToGrid: (state) => {
      state.snapToGrid = !state.snapToGrid
    },

    // Bulk operations
    loadCanvas: (state, action) => {
      const { components, layout, theme } = action.payload
      state.components = components || []
      state.layout = layout || state.layout
      state.theme = theme || state.theme
      state.selectedComponent = null
    },

    clearCanvas: (state) => {
      state.components = []
      state.selectedComponent = null
      state.history.past.push({
        type: "CLEAR_CANVAS",
        components: [...state.components],
      })
    },

    // History management
    undo: (state) => {
      if (state.history.past.length > 0) {
        const lastAction = state.history.past.pop()
        state.history.future.push(lastAction)

        // Apply undo logic based on action type
        switch (lastAction.type) {
          case "ADD_COMPONENT":
            state.components = state.components.filter((c) => c.id !== lastAction.component.id)
            break
          case "DELETE_COMPONENT":
            state.components.splice(lastAction.index, 0, lastAction.component)
            break
          case "UPDATE_COMPONENT":
            const index = state.components.findIndex((c) => c.id === lastAction.id)
            if (index !== -1) {
              state.components[index] = lastAction.oldComponent
            }
            break
          case "MOVE_COMPONENT":
            const comp = state.components.find((c) => c.id === lastAction.id)
            if (comp) {
              comp.position = lastAction.oldPosition
            }
            break
        }
      }
    },

    redo: (state) => {
      if (state.history.future.length > 0) {
        const nextAction = state.history.future.pop()
        state.history.past.push(nextAction)

        // Apply redo logic
        switch (nextAction.type) {
          case "ADD_COMPONENT":
            state.components.push(nextAction.component)
            break
          case "DELETE_COMPONENT":
            state.components.splice(nextAction.index, 1)
            break
          case "UPDATE_COMPONENT":
            const index = state.components.findIndex((c) => c.id === nextAction.id)
            if (index !== -1) {
              state.components[index] = nextAction.newComponent
            }
            break
          case "MOVE_COMPONENT":
            const comp = state.components.find((c) => c.id === nextAction.id)
            if (comp) {
              comp.position = nextAction.newPosition
            }
            break
        }
      }
    },
  },
})

export const {
  addComponent,
  updateComponent,
  deleteComponent,
  moveComponent,
  selectComponent,
  clearSelection,
  setDraggedComponent,
  updateLayout,
  setTheme,
  setZoom,
  toggleSnapToGrid,
  loadCanvas,
  clearCanvas,
  undo,
  redo,
} = canvasSlice.actions

export default canvasSlice.reducer
