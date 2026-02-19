import { create } from 'zustand'
import type {
  GalleryItem,
  GalleryFilters,
  GalleryFavorite,
  AIGenerationConfig,
} from '@/lib/gallery-types'
import { galleryItems } from '@/lib/galleryData'

const AI_CONFIG_KEY = 'figure-painter-ai-config'

function loadAIConfig(): AIGenerationConfig | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(AI_CONFIG_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveAIConfig(config: AIGenerationConfig): void {
  localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(config))
}

interface GalleryActions {
  setFilters: (filters: Partial<GalleryFilters>) => void
  resetFilters: () => void
  toggleFavorite: (itemId: string) => void
  loadFavorites: () => Promise<void>
  setSelectedItem: (item: GalleryItem | null) => void
  setAIConfig: (config: AIGenerationConfig) => void
  clearAIConfig: () => void
}

interface GalleryStore {
  items: GalleryItem[]
  filters: GalleryFilters
  favorites: Set<string>
  selectedItem: GalleryItem | null
  aiConfig: AIGenerationConfig | null
  actions: GalleryActions
}

const defaultFilters: GalleryFilters = {
  chartTypes: [],
  journalStyles: [],
  colorTones: [],
  search: '',
}

export const useGalleryStore = create<GalleryStore>()((set, get) => ({
  items: galleryItems,
  filters: { ...defaultFilters },
  favorites: new Set<string>(),
  selectedItem: null,
  aiConfig: loadAIConfig(),
  actions: {
    setFilters: (partial) =>
      set((state) => ({
        filters: { ...state.filters, ...partial },
      })),
    resetFilters: () => set({ filters: { ...defaultFilters } }),
    toggleFavorite: (itemId) => {
      set((state) => {
        const next = new Set(state.favorites)
        if (next.has(itemId)) {
          next.delete(itemId)
        } else {
          next.add(itemId)
        }
        return { favorites: next }
      })
      // Persist async
      import('@/services/db').then(async ({ db }) => {
        const favs = get().favorites
        if (favs.has(itemId)) {
          await db.galleryFavorites.put({
            id: itemId,
            itemId,
            createdAt: Date.now(),
          })
        } else {
          await db.galleryFavorites.delete(itemId)
        }
      })
    },
    loadFavorites: async () => {
      const { db } = await import('@/services/db')
      const all = await db.galleryFavorites.toArray()
      set({ favorites: new Set(all.map((f: GalleryFavorite) => f.itemId)) })
    },
    setSelectedItem: (item) => set({ selectedItem: item }),
    setAIConfig: (config) => {
      saveAIConfig(config)
      set({ aiConfig: config })
    },
    clearAIConfig: () => {
      localStorage.removeItem(AI_CONFIG_KEY)
      set({ aiConfig: null })
    },
  },
}))

/** Selector: filtered items */
export function getFilteredItems(state: GalleryStore): GalleryItem[] {
  const { items, filters } = state
  return items.filter((item) => {
    // Text search
    if (filters.search) {
      const q = filters.search.toLowerCase()
      const match =
        item.title.toLowerCase().includes(q) ||
        item.titleZh.includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.descriptionZh.includes(q) ||
        item.source.name.toLowerCase().includes(q)
      if (!match) return false
    }
    // Chart type filter
    if (
      filters.chartTypes.length > 0 &&
      !item.chartTypes.some((t) => filters.chartTypes.includes(t))
    ) {
      return false
    }
    // Journal style filter
    if (
      filters.journalStyles.length > 0 &&
      !item.journalStyles.some((s) => filters.journalStyles.includes(s))
    ) {
      return false
    }
    // Color tone filter
    if (
      filters.colorTones.length > 0 &&
      !item.colorTones.some((c) => filters.colorTones.includes(c))
    ) {
      return false
    }
    return true
  })
}
