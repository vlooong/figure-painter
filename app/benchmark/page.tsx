'use client'

import { useState, useMemo } from 'react'
import { useTranslation } from '@/lib/i18n'
import { getDatasetsByTask, searchDatasets } from '@/lib/benchmarkData'
import { TaskFilter } from '@/components/benchmark/TaskFilter'
import { DatasetSearch } from '@/components/benchmark/DatasetSearch'
import { DatasetGrid } from '@/components/benchmark/DatasetGrid'
import { BenchmarkDetail } from '@/components/benchmark/BenchmarkDetail'

export default function BenchmarkPage() {
  const { t, locale } = useTranslation()

  const [selectedTask, setSelectedTask] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(null)

  const filteredDatasets = useMemo(() => {
    const byTask = getDatasetsByTask(selectedTask)
    return searchDatasets(byTask, searchQuery, locale)
  }, [selectedTask, searchQuery, locale])

  // Detail view
  if (selectedDatasetId) {
    return (
      <main className="mx-auto h-[calc(100vh-3rem)] max-w-7xl overflow-y-auto px-4 py-6">
        <BenchmarkDetail
          datasetId={selectedDatasetId}
          onBack={() => setSelectedDatasetId(null)}
        />
      </main>
    )
  }

  // List view
  return (
    <main className="mx-auto h-[calc(100vh-3rem)] max-w-7xl overflow-y-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t('benchmark.title')}</h1>
        <p className="text-muted-foreground">{t('benchmark.subtitle')}</p>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <TaskFilter selectedTask={selectedTask} onSelect={setSelectedTask} />
        <DatasetSearch value={searchQuery} onChange={setSearchQuery} />
      </div>

      <p className="mb-3 text-sm text-muted-foreground">
        {filteredDatasets.length} {t('benchmark.datasets')}
      </p>

      <DatasetGrid
        datasets={filteredDatasets}
        onSelect={setSelectedDatasetId}
      />
    </main>
  )
}
