'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useDatasetStore } from '@/stores/datasetStore'
import { usePlotStore } from '@/stores/plotStore'
import { importCSV } from '@/services/exportService'
import { db } from '@/services/db'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n'
import { Copy } from 'lucide-react'
import type { Dataset } from '@/lib/types'

export function DatasetSelector() {
  const { t } = useTranslation()
  const datasets = useDatasetStore((s) => s.datasets)
  const { addDataset, loadFromDb, duplicateDataset } = useDatasetStore((s) => s.actions)
  const activePlot = usePlotStore((s) => s.activePlot)
  const { addDatasetToPlot, removeDatasetFromPlot } = usePlotStore(
    (s) => s.actions
  )
  const csvInputRef = useRef<HTMLInputElement>(null)

  // Load datasets from Dexie on mount
  useEffect(() => {
    loadFromDb()
  }, [loadFromDb])

  const datasetList = Array.from(datasets.values())
  const selectedIds = new Set(activePlot?.datasetIds ?? [])

  const handleToggle = useCallback(
    (id: string, checked: boolean) => {
      if (checked) {
        addDatasetToPlot(id)
      } else {
        removeDatasetFromPlot(id)
      }
    },
    [addDatasetToPlot, removeDatasetFromPlot]
  )

  const handleDuplicate = useCallback(
    (id: string) => {
      const newId = duplicateDataset(id)
      if (newId) addDatasetToPlot(newId)
    },
    [duplicateDataset, addDatasetToPlot]
  )

  const handleImportCSV = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      const points = await importCSV(file)
      if (points.length > 0) {
        const dataset: Dataset = {
          id: crypto.randomUUID(),
          name: file.name.replace(/\.[^.]+$/, ''),
          color: getNextColor(datasets.size),
          points,
          sourceType: 'imported',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }
        addDataset(dataset)
        await db.datasets.put(dataset)
      }
      e.target.value = ''
    },
    [addDataset, datasets.size]
  )

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">{t('plot.datasets.title')}</h2>
        <span className="text-xs text-muted-foreground">
          {selectedIds.size} {t('plot.datasets.selected')}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {datasetList.length === 0 ? (
          <p className="py-4 text-center text-xs text-muted-foreground">
            {t('plot.datasets.empty')}
          </p>
        ) : (
          <ul className="flex flex-col gap-1">
            {datasetList.map((ds) => {
              const isSelected = selectedIds.has(ds.id)
              return (
                <li
                  key={ds.id}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent/50"
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) =>
                      handleToggle(ds.id, checked === true)
                    }
                  />
                  <span
                    className="inline-block size-3 shrink-0 rounded-full"
                    style={{ backgroundColor: ds.color }}
                  />
                  <span className="flex-1 truncate text-sm">{ds.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {ds.points.length} {t('plot.datasets.points')}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={() => handleDuplicate(ds.id)}
                    title={t('plot.datasets.copy')}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <div>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => csvInputRef.current?.click()}
        >
          {t('plot.datasets.importCSV')}
        </Button>
        <input
          ref={csvInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleImportCSV}
        />
      </div>
    </div>
  )
}

/** Simple palette for auto-assigning colors to datasets */
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

function getNextColor(index: number): string {
  return PALETTE[index % PALETTE.length]
}
