import type { TaskCategory, BenchmarkDataset, BenchmarkTable } from './types'
import data from './benchmark-data.json'

// ---- Re-export typed data from JSON ----
export const ALGORITHM_PAPERS: Record<string, string> = data.algorithmPapers
export const TASK_CATEGORIES: TaskCategory[] = data.taskCategories as TaskCategory[]
export const BENCHMARK_DATASETS: BenchmarkDataset[] = data.datasets as BenchmarkDataset[]
export const BENCHMARK_TABLES: BenchmarkTable[] = data.tables as BenchmarkTable[]

// ---- Helper Functions ----

export function getDatasetsByTask(taskId: string | null): BenchmarkDataset[] {
  if (!taskId) return BENCHMARK_DATASETS
  return BENCHMARK_DATASETS.filter((d) => d.taskIds.includes(taskId))
}

export function searchDatasets(
  datasets: BenchmarkDataset[],
  query: string,
  locale: 'en' | 'zh'
): BenchmarkDataset[] {
  if (!query.trim()) return datasets
  const q = query.toLowerCase()
  return datasets.filter((d) => {
    const fields =
      locale === 'zh'
        ? [d.name, d.fullNameZh, d.domainZh, d.descriptionZh]
        : [d.name, d.fullName, d.domain, d.description]
    return fields.some((f) => f.toLowerCase().includes(q))
  })
}

export function getTableForDataset(
  datasetId: string,
  taskId: string
): BenchmarkTable | undefined {
  return BENCHMARK_TABLES.find(
    (t) => t.datasetId === datasetId && t.taskId === taskId
  )
}
