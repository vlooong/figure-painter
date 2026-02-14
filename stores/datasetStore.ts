import { create } from 'zustand'
import type { Dataset } from '@/lib/types'
import {
  loadAllDatasets,
  saveDataset,
  deleteDataset as deleteDatasetDb,
} from '@/services/db'

interface DatasetActions {
  addDataset: (dataset: Dataset) => void
  updateDataset: (id: string, updates: Partial<Dataset>) => void
  removeDataset: (id: string) => void
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
