import Dexie, { type EntityTable } from 'dexie'
import type { ImageRecord, Dataset, PlotConfig, ChartTemplate } from '@/lib/types'

class FigurePainterDB extends Dexie {
  images!: EntityTable<ImageRecord, 'id'>
  datasets!: EntityTable<Dataset, 'id'>
  plots!: EntityTable<PlotConfig, 'id'>
  templates!: EntityTable<ChartTemplate, 'id'>

  constructor() {
    super('FigurePainterDB')
    this.version(1).stores({
      images: 'id, name, createdAt',
      datasets: 'id, name, sourceType, sourceImageId, createdAt',
      plots: 'id, title, createdAt',
      templates: 'id, name',
    })
  }
}

export const db = new FigurePainterDB()

// ---- Dataset CRUD helpers ----

export async function saveDataset(dataset: Dataset): Promise<void> {
  await db.datasets.put(dataset)
}

export async function loadAllDatasets(): Promise<Dataset[]> {
  return db.datasets.orderBy('createdAt').reverse().toArray()
}

export async function deleteDataset(id: string): Promise<void> {
  await db.datasets.delete(id)
}

// ---- PlotConfig CRUD helpers ----

export async function savePlotConfig(config: PlotConfig): Promise<void> {
  await db.plots.put(config)
}

export async function loadAllPlotConfigs(): Promise<PlotConfig[]> {
  return db.plots.orderBy('createdAt').reverse().toArray()
}
