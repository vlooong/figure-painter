'use client'

import { useState } from 'react'
import { useTranslation } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { BENCHMARK_DATASETS, TASK_CATEGORIES, getTableForDataset } from '@/lib/benchmarkData'
import { BenchmarkResultTable } from './BenchmarkResultTable'
import { CopyMenu } from './CopyMenu'
import { cn } from '@/lib/utils'

interface BenchmarkDetailProps {
  datasetId: string
  onBack: () => void
}

export function BenchmarkDetail({ datasetId, onBack }: BenchmarkDetailProps) {
  const { t, locale } = useTranslation()

  const dataset = BENCHMARK_DATASETS.find((d) => d.id === datasetId)
  if (!dataset) return null

  // Get the first available task for this dataset
  const availableTaskIds = dataset.taskIds
  const [selectedTask, setSelectedTask] = useState(availableTaskIds[0])
  const table = getTableForDataset(datasetId, selectedTask)

  const [selectedSettingIdx, setSelectedSettingIdx] = useState(0)
  const setting = table?.settings[selectedSettingIdx]

  const taskMap = new Map(TASK_CATEGORIES.map((c) => [c.id, c]))

  return (
    <div className="space-y-4">
      {/* Back button */}
      <Button variant="ghost" size="sm" onClick={onBack}>
        {t('benchmark.backToList')}
      </Button>

      {/* Dataset header */}
      <div>
        <h2 className="text-2xl font-bold">{dataset.name}</h2>
        <p className="text-muted-foreground">
          {locale === 'zh' ? dataset.fullNameZh : dataset.fullName}
        </p>
        <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span>
            {t('benchmark.domain')}: {locale === 'zh' ? dataset.domainZh : dataset.domain}
          </span>
          {dataset.features != null && (
            <span>
              {t('benchmark.features')}: {dataset.features}
            </span>
          )}
          {dataset.frequency && (
            <span>
              {t('benchmark.frequency')}: {dataset.frequency}
            </span>
          )}
          {dataset.source && (
            <a
              href={dataset.source}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {t('benchmark.source')}
            </a>
          )}
        </div>
        <p className="mt-2 text-sm">
          {locale === 'zh' ? dataset.descriptionZh : dataset.description}
        </p>
      </div>

      {/* Task selector (if dataset belongs to multiple tasks) */}
      {availableTaskIds.length > 1 && (
        <div className="flex gap-1.5">
          {availableTaskIds.map((tid) => {
            const cat = taskMap.get(tid)
            return (
              <button
                key={tid}
                onClick={() => {
                  setSelectedTask(tid)
                  setSelectedSettingIdx(0)
                }}
                className={cn(
                  'rounded-full px-3 py-1 text-sm font-medium transition-colors',
                  selectedTask === tid
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-accent'
                )}
              >
                {cat ? (locale === 'zh' ? cat.nameZh : cat.name) : tid}
              </button>
            )
          })}
        </div>
      )}

      {table && setting && (
        <>
          {/* Setting selector (e.g., prediction length tabs) */}
          {table.settings.length > 1 && (
            <div>
              <span className="mr-2 text-sm text-muted-foreground">
                {locale === 'zh' ? table.settingLabelZh : table.settingLabel}:
              </span>
              <div className="inline-flex gap-1">
                {table.settings.map((s, idx) => (
                  <button
                    key={s.name}
                    onClick={() => setSelectedSettingIdx(idx)}
                    className={cn(
                      'rounded-md px-2.5 py-1 text-sm font-medium transition-colors',
                      selectedSettingIdx === idx
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-accent'
                    )}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Copy menu */}
          <CopyMenu
            metricNames={table.metricNames}
            setting={setting}
            lowerIsBetter={table.lowerIsBetter}
          />

          {/* Results table */}
          <BenchmarkResultTable
            metricNames={table.metricNames}
            lowerIsBetter={table.lowerIsBetter}
            setting={setting}
          />
        </>
      )}
    </div>
  )
}
