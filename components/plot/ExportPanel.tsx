'use client'

import { useState, useCallback, type RefObject } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { usePlotStore, getEffectiveTemplate } from '@/stores/plotStore'
import { exportChartPNG, exportChartSVG } from '@/services/exportService'
import { useTranslation } from '@/lib/i18n'
import type { ChartCanvasHandle } from '@/components/plot/ChartCanvas'

const DPI_OPTIONS = [150, 300, 600]

interface ExportPanelProps {
  chartCanvasRef: RefObject<ChartCanvasHandle | null>
}

export function ExportPanel({ chartCanvasRef }: ExportPanelProps) {
  const { t } = useTranslation()
  const activePlot = usePlotStore((s) => s.activePlot)
  const template = activePlot ? getEffectiveTemplate(activePlot) : null

  const defaultFilename = activePlot?.title || 'chart'
  const [filename, setFilename] = useState(defaultFilename)
  const [dpi, setDpi] = useState(template?.dimensions.dpi ?? 300)

  const exportWidth = template?.dimensions.width ?? 800
  const exportHeight = template?.dimensions.height ?? 600

  const handleExportPNG = useCallback(() => {
    const instance = chartCanvasRef.current?.getChartInstance()
    if (!instance) return

    const pixelRatio = dpi / 96
    const dataURL = instance.getDataURL({
      type: 'png',
      pixelRatio,
      backgroundColor: '#fff',
    })
    exportChartPNG(dataURL, filename || 'chart')
  }, [chartCanvasRef, dpi, filename])

  const handleExportSVG = useCallback(() => {
    const instance = chartCanvasRef.current?.getChartInstance()
    if (!instance) return

    const dataURL = instance.getDataURL({
      type: 'svg',
      backgroundColor: '#fff',
    })
    exportChartSVG(dataURL, filename || 'chart')
  }, [chartCanvasRef, filename])

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold">{t('plot.exportChart.title')}</h3>

      {/* Filename input */}
      <div>
        <label className="mb-1 block text-xs text-muted-foreground">
          {t('plot.exportChart.filename')}
        </label>
        <Input
          type="text"
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
          placeholder={t('plot.exportChart.filenamePlaceholder')}
          className="h-8 text-sm"
        />
      </div>

      {/* DPI selector */}
      <div>
        <label className="mb-1 block text-xs text-muted-foreground">
          {t('plot.exportChart.dpi')}
        </label>
        <select
          value={dpi}
          onChange={(e) => setDpi(Number(e.target.value))}
          className="h-8 w-full rounded-md border bg-background px-2 text-sm"
        >
          {DPI_OPTIONS.map((d) => (
            <option key={d} value={d}>
              {t('plot.exportChart.dpiOption', { d })}
            </option>
          ))}
        </select>
      </div>

      {/* Export dimensions info */}
      <p className="text-xs text-muted-foreground">
        {t('plot.exportChart.templateSize', { w: exportWidth, h: exportHeight })}
        {dpi !== 96 && (
          <span className="ml-1">
            {t('plot.exportChart.outputSize', { w: Math.round(exportWidth * dpi / 96), h: Math.round(exportHeight * dpi / 96) })}
          </span>
        )}
      </p>

      {/* Export buttons */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleExportPNG} className="flex-1">
          {t('plot.exportChart.exportPNG')}
        </Button>
        <Button variant="outline" size="sm" onClick={handleExportSVG} className="flex-1">
          {t('plot.exportChart.exportSVG')}
        </Button>
      </div>
    </div>
  )
}
