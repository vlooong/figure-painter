// ---- Gallery Item ----

export type ChartType =
  | 'line'
  | 'bar'
  | 'scatter'
  | 'heatmap'
  | 'box'
  | 'violin'
  | 'area'
  | 'radar'
  | 'pie'
  | 'sankey'
  | 'volcano'
  | 'bubble'
  | 'ridge'
  | 'waterfall'
  | 'other'

export type JournalStyle =
  | 'Nature'
  | 'Science'
  | 'IEEE'
  | 'ACS'
  | 'Cell'
  | 'PNAS'
  | 'Lancet'
  | 'Custom'

export type ColorTone =
  | 'warm'
  | 'cool'
  | 'neutral'
  | 'vibrant'
  | 'muted'
  | 'monochrome'

export interface GalleryItem {
  id: string
  title: string
  titleZh: string
  description: string
  descriptionZh: string
  /** Relative path under /gallery/ in public dir */
  imagePath: string
  thumbnailPath: string
  /** Source info */
  source: {
    type: 'paper' | 'website' | 'custom'
    name: string
    url?: string
  }
  /** Classification tags */
  chartTypes: ChartType[]
  journalStyles: JournalStyle[]
  colorTones: ColorTone[]
  /** Extracted color palette from the image */
  colorPalette: string[]
  /** Creation timestamp */
  createdAt: number
}

// ---- Filter State ----

export interface GalleryFilters {
  chartTypes: ChartType[]
  journalStyles: JournalStyle[]
  colorTones: ColorTone[]
  search: string
}

// ---- Favorite Record (persisted in Dexie) ----

export interface GalleryFavorite {
  id: string
  itemId: string
  createdAt: number
}

// ---- AI Generation Config (stored in localStorage) ----

export interface AIGenerationConfig {
  apiKey: string
  baseUrl: string
  modelName: string
}

// ---- Prompt Enhancement (Phase 2 placeholder) ----

export interface PromptEnhancementRequest {
  styleImageId: string
  chartType: ChartType
  userPrompt: string
}

export interface PromptEnhancementResult {
  enhancedPrompt: string
  suggestedParameters: Record<string, unknown>
}
