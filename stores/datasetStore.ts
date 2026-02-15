import { create } from 'zustand'
import type { Dataset } from '@/lib/types'
import {
  loadAllDatasets,
  saveDataset,
  deleteDataset as deleteDatasetDb,
} from '@/services/db'

const PALETTE = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#22c55e', // green
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
]

interface DatasetActions {
  addDataset: (dataset: Dataset) => void
  updateDataset: (id: string, updates: Partial<Dataset>) => void
  removeDataset: (id: string) => void
  duplicateDataset: (id: string) => string | null
  setActiveId: (id: string | null) => void
  loadFromDb: () => Promise<void>
  saveToDb: (dataset: Dataset) => Promise<void>
}

interface DatasetStore {
  datasets: Map<string, Dataset>
  activeId: string | null
  actions: DatasetActions
}

export const useDatasetStore = create<DatasetStore>()((set, get) => ({
  datasets: new Map(),
  activeId: null,
  actions: {
    addDataset: (dataset) =>
      set((state) => {
        const next = new Map(state.datasets)
        next.set(dataset.id, dataset)
        return { datasets: next }
      }),
    updateDataset: (id, updates) =>
      set((state) => {
        const existing = state.datasets.get(id)
        if (!existing) return state
        const next = new Map(state.datasets)
        next.set(id, { ...existing, ...updates, updatedAt: Date.now() })
        return { datasets: next }
      }),
    removeDataset: (id) => {
      set((state) => {
        const next = new Map(state.datasets)
        next.delete(id)
        return {
          datasets: next,
          activeId: state.activeId === id ? null : state.activeId,
        }
      })
      deleteDatasetDb(id).catch(() => {
        // Silently handle DB errors - store state is already updated
      })
    },
    duplicateDataset: (id) => {
      const source = get().datasets.get(id)
      if (!source) return null
      const clone: Dataset = {
        id: crypto.randomUUID(),
        name: source.name + ' (Copy)',
        color: PALETTE[get().datasets.size % PALETTE.length],
        points: source.points.map((p) => ({ ...p })),
        sourceType: source.sourceType,
        sourceImageId: source.sourceImageId,
        calibration: source.calibration,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      set((state) => {
        const next = new Map(state.datasets)
        next.set(clone.id, clone)
        return { datasets: next }
      })
      saveDataset(clone).catch(() => {
        // Silently handle DB errors - store state is already updated
      })
      return clone.id
    },
    setActiveId: (id) => set({ activeId: id }),
    loadFromDb: async () => {
      const datasets = await loadAllDatasets()
      const map = new Map<string, Dataset>()
      for (const ds of datasets) {
        map.set(ds.id, ds)
      }
      set({ datasets: map })
    },
    saveToDb: async (dataset) => {
      get().actions.addDataset(dataset)
      await saveDataset(dataset)
    },
  },
}))
