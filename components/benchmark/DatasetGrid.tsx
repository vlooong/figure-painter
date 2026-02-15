'use client'

import { useTranslation } from '@/lib/i18n'
import { TASK_CATEGORIES } from '@/lib/benchmarkData'
import type { BenchmarkDataset } from '@/lib/types'

interface DatasetGridProps {
  datasets: BenchmarkDataset[]
  onSelect: (datasetId: string) => void
}

export function DatasetGrid({ datasets, onSelect }: DatasetGridProps) {
  const { t, locale } = useTranslation()

  if (datasets.length === 0) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        {t('benchmark.noResults')}
      </p>
    )
  }

  const taskMap = new Map(TASK_CATEGORIES.map((c) => [c.id, c]))

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {datasets.map((ds) => (
        <button
          key={ds.id}
          onClick={() => onSelect(ds.id)}
          className="rounded-lg border bg-card p-4 text-left transition-colors hover:bg-accent/50"
        >
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold">{ds.name}</h3>
            <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {locale === 'zh' ? ds.domainZh : ds.domain}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {locale === 'zh' ? ds.fullNameZh : ds.fullName}
          </p>
          <div className="mt-3 flex flex-wrap gap-1">
            {ds.taskIds.map((tid) => {
              const cat = taskMap.get(tid)
              return cat ? (
                <span
                  key={tid}
                  className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
                >
                  {locale === 'zh' ? cat.nameZh : cat.name}
                </span>
              ) : null
            })}
          </div>
          <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
            {ds.features != null && (
              <span>
                {t('benchmark.features')}: {ds.features}
              </span>
            )}
            {ds.frequency && (
              <span>
                {t('benchmark.frequency')}: {ds.frequency}
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  )
}
