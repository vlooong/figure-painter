import { create } from 'zustand'
import type { PlotConfig, ChartTemplate, AdvancedConfig } from '@/lib/types'
import { getTemplateById } from '@/lib/templates'

interface PlotActions {
  addPlot: (plot: PlotConfig) => void
  updatePlot: (id: string, updates: Partial<PlotConfig>) => void
  removePlot: (id: string) => void
  setActiveId: (id: string | null) => void
  addTemplate: (template: ChartTemplate) => void
  removeTemplate: (id: string) => void
  // New actions for plot page
  createPlot: () => PlotConfig
  updatePlotConfig: (partial: Partial<PlotConfig>) => void
  addDatasetToPlot: (datasetId: string) => void
  removeDatasetFromPlot: (datasetId: string) => void
  // Template actions
  applyTemplate: (templateId: string) => void
  setCustomOverrides: (overrides: Partial<ChartTemplate>) => void
  resetToTemplate: () => void
  // Advanced config
  updateAdvancedConfig: (config: Partial<AdvancedConfig>) => void
}

interface PlotStore {
  plots: Map<string, PlotConfig>
  templates: Map<string, ChartTemplate>
  activeId: string | null
  activePlot: PlotConfig | null
  actions: PlotActions
}

function makeDefaultPlot(): PlotConfig {
  return {
    id: crypto.randomUUID(),
    title: '',
    xAxis: { type: 'linear', min: -Infinity, max: Infinity },
    yAxis: { type: 'linear', min: -Infinity, max: Infinity },
    datasetIds: [],
    templateId: '',
    customOverrides: {},
    advancedConfig: {},
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}

export const usePlotStore = create<PlotStore>()((set, get) => ({
  plots: new Map(),
  templates: new Map(),
  activeId: null,
  activePlot: null,
  actions: {
    addPlot: (plot) =>
      set((state) => {
        const next = new Map(state.plots)
        next.set(plot.id, plot)
        return { plots: next }
      }),
    updatePlot: (id, updates) =>
      set((state) => {
        const existing = state.plots.get(id)
        if (!existing) return state
        const next = new Map(state.plots)
        next.set(id, { ...existing, ...updates, updatedAt: Date.now() })
        return { plots: next }
      }),
    removePlot: (id) =>
      set((state) => {
        const next = new Map(state.plots)
        next.delete(id)
        return {
          plots: next,
          activeId: state.activeId === id ? null : state.activeId,
        }
      }),
    setActiveId: (id) => set({ activeId: id }),
    addTemplate: (template) =>
      set((state) => {
        const next = new Map(state.templates)
        next.set(template.id, template)
        return { templates: next }
      }),
    removeTemplate: (id) =>
      set((state) => {
        const next = new Map(state.templates)
        next.delete(id)
        return { templates: next }
      }),

    // -- New actions for plot page --

    createPlot: () => {
      const plot = makeDefaultPlot()
      set((state) => {
        const next = new Map(state.plots)
        next.set(plot.id, plot)
        return { plots: next, activeId: plot.id, activePlot: plot }
      })
      return plot
    },

    updatePlotConfig: (partial) => {
      const state = get()
      let plot = state.activePlot
      if (!plot) {
        // Auto-create if none exists
        plot = makeDefaultPlot()
      }
      const updated: PlotConfig = {
        ...plot,
        ...partial,
        updatedAt: Date.now(),
      }
      const next = new Map(state.plots)
      next.set(updated.id, updated)
      set({ plots: next, activeId: updated.id, activePlot: updated })
    },

    addDatasetToPlot: (datasetId) => {
      const state = get()
      let plot = state.activePlot
      if (!plot) {
        plot = makeDefaultPlot()
      }
      if (plot.datasetIds.includes(datasetId)) return
      const updated: PlotConfig = {
        ...plot,
        datasetIds: [...plot.datasetIds, datasetId],
        updatedAt: Date.now(),
      }
      const next = new Map(state.plots)
      next.set(updated.id, updated)
      set({ plots: next, activeId: updated.id, activePlot: updated })
    },

    removeDatasetFromPlot: (datasetId) => {
      const state = get()
      const plot = state.activePlot
      if (!plot) return
      const updated: PlotConfig = {
        ...plot,
        datasetIds: plot.datasetIds.filter((id) => id !== datasetId),
        updatedAt: Date.now(),
      }
      const next = new Map(state.plots)
      next.set(updated.id, updated)
      set({ plots: next, activeId: updated.id, activePlot: updated })
    },

    applyTemplate: (templateId) => {
      const state = get()
      let plot = state.activePlot
      if (!plot) {
        plot = makeDefaultPlot()
      }
      const updated: PlotConfig = {
        ...plot,
        templateId,
        customOverrides: {},
        updatedAt: Date.now(),
      }
      const next = new Map(state.plots)
      next.set(updated.id, updated)
      set({ plots: next, activeId: updated.id, activePlot: updated })
    },

    setCustomOverrides: (overrides) => {
      const state = get()
      const plot = state.activePlot
      if (!plot) return
      const merged: Partial<ChartTemplate> = {
        ...plot.customOverrides,
        ...overrides,
      }
      // Deep-merge fontSize if both exist
      if (overrides.fontSize && plot.customOverrides.fontSize) {
        merged.fontSize = {
          ...plot.customOverrides.fontSize,
          ...overrides.fontSize,
        }
      }
      // Deep-merge axisStyle if both exist
      if (overrides.axisStyle && plot.customOverrides.axisStyle) {
        merged.axisStyle = {
          ...plot.customOverrides.axisStyle,
          ...overrides.axisStyle,
        }
      }
      const updated: PlotConfig = {
        ...plot,
        customOverrides: merged,
        updatedAt: Date.now(),
      }
      const next = new Map(state.plots)
      next.set(updated.id, updated)
      set({ plots: next, activeId: updated.id, activePlot: updated })
    },

    resetToTemplate: () => {
      const state = get()
      const plot = state.activePlot
      if (!plot) return
      const updated: PlotConfig = {
        ...plot,
        customOverrides: {},
        updatedAt: Date.now(),
      }
      const next = new Map(state.plots)
      next.set(updated.id, updated)
      set({ plots: next, activeId: updated.id, activePlot: updated })
    },

    updateAdvancedConfig: (config) => {
      const state = get()
      const plot = state.activePlot
      if (!plot) return
      const updated: PlotConfig = {
        ...plot,
        advancedConfig: { ...plot.advancedConfig, ...config },
        updatedAt: Date.now(),
      }
      const next = new Map(state.plots)
      next.set(updated.id, updated)
      set({ plots: next, activeId: updated.id, activePlot: updated })
    },
  },
}))

/** Merge base template with custom overrides - standalone function (NOT in store) */
export function getEffectiveTemplate(
  plot: PlotConfig
): ChartTemplate | null {
  const base = getTemplateById(plot.templateId)
  if (!base) return null

  const overrides = plot.customOverrides
  if (!overrides || Object.keys(overrides).length === 0) return base

  return {
    ...base,
    ...overrides,
    fontSize: {
      ...base.fontSize,
      ...overrides.fontSize,
    },
    axisStyle: {
      ...base.axisStyle,
      ...overrides.axisStyle,
    },
    dimensions: {
      ...base.dimensions,
      ...overrides.dimensions,
    },
  }
}
