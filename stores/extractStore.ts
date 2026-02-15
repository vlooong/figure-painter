import { create } from 'zustand'
import type {
  ImageRecord,
  Calibration,
  CalibrationPoint,
  DataPoint,
  ExtractTool,
} from '@/lib/types'

interface UndoEntry {
  index: number
  prev: DataPoint
}

interface ExtractActions {
  setImage: (image: ImageRecord | null) => void
  setCalibration: (calibration: Calibration | null) => void
  setPendingCalibrationPoints: (points: CalibrationPoint[]) => void
  clearPendingCalibrationPoints: () => void
  setTool: (tool: ExtractTool) => void
  setSelectedColor: (color: string | null) => void
  setTolerance: (tolerance: number) => void
  setSampleStep: (step: number) => void
  setExtractedPoints: (points: DataPoint[]) => void
  setEditingPoints: (points: DataPoint[]) => void
  updatePoint: (index: number, point: DataPoint) => void
  deletePoint: (index: number) => void
  addPoint: (point: DataPoint) => void
  sortPointsByX: (ascending: boolean) => void
  clearExtraction: () => void
  reset: () => void
  // Drag-edit actions
  selectPoint: (index: number | null) => void
  movePoint: (index: number, newX: number, newY: number) => void
  undoLastMove: () => void
}

interface ExtractStore {
  image: ImageRecord | null
  calibration: Calibration | null
  pendingCalibrationPoints: CalibrationPoint[]
  tool: ExtractTool
  selectedColor: string | null
  tolerance: number
  sampleStep: number
  extractedPoints: DataPoint[]
  editingPoints: DataPoint[]
  // Drag-edit state
  selectedPointIndex: number | null
  undoStack: UndoEntry[]
  actions: ExtractActions
}

const initialState = {
  image: null,
  calibration: null,
  pendingCalibrationPoints: [] as CalibrationPoint[],
  tool: 'select' as ExtractTool,
  selectedColor: null,
  tolerance: 30,
  sampleStep: 1,
  extractedPoints: [],
  editingPoints: [],
  selectedPointIndex: null as number | null,
  undoStack: [] as UndoEntry[],
}

export const useExtractStore = create<ExtractStore>()((set) => ({
  ...initialState,
  actions: {
    setImage: (image) => set({ image }),
    setCalibration: (calibration) => set({ calibration }),
    setPendingCalibrationPoints: (points) =>
      set({ pendingCalibrationPoints: points }),
    clearPendingCalibrationPoints: () => set({ pendingCalibrationPoints: [] }),
    setTool: (tool) => set({ tool }),
    setSelectedColor: (color) => set({ selectedColor: color }),
    setTolerance: (tolerance) => set({ tolerance }),
    setSampleStep: (step) => set({ sampleStep: step }),
    setExtractedPoints: (points) =>
      set({ extractedPoints: points, editingPoints: points }),
    setEditingPoints: (points) => set({ editingPoints: points }),
    updatePoint: (index, point) =>
      set((state) => {
        const next = [...state.editingPoints]
        if (index >= 0 && index < next.length) {
          next[index] = point
        }
        return { editingPoints: next }
      }),
    deletePoint: (index) =>
      set((state) => ({
        editingPoints: state.editingPoints.filter((_, i) => i !== index),
      })),
    addPoint: (point) =>
      set((state) => ({
        editingPoints: [...state.editingPoints, point],
      })),
    sortPointsByX: (ascending) =>
      set((state) => ({
        editingPoints: [...state.editingPoints].sort((a, b) =>
          ascending ? a.x - b.x : b.x - a.x
        ),
      })),
    clearExtraction: () =>
      set({
        selectedColor: null,
        tolerance: 30,
        sampleStep: 1,
        extractedPoints: [],
        editingPoints: [],
        selectedPointIndex: null,
        undoStack: [],
      }),
    reset: () => set(initialState),
    // Drag-edit actions
    selectPoint: (index) => set({ selectedPointIndex: index }),
    movePoint: (index, newX, newY) =>
      set((state) => {
        const point = state.editingPoints[index]
        if (!point || index < 0 || index >= state.editingPoints.length) {
          return state
        }
        const prev = { ...point }
        const next = [...state.editingPoints]
        next[index] = { x: newX, y: newY }
        return {
          editingPoints: next,
          undoStack: [...state.undoStack, { index, prev }],
        }
      }),
    undoLastMove: () =>
      set((state) => {
        if (state.undoStack.length === 0) return state
        const stack = [...state.undoStack]
        const entry = stack.pop()!
        const next = [...state.editingPoints]
        if (entry.index >= 0 && entry.index < next.length) {
          next[entry.index] = entry.prev
        }
        return { editingPoints: next, undoStack: stack }
      }),
  },
}))
