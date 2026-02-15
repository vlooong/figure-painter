'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ImageCanvas,
  type ImageCanvasHandle,
} from '@/components/extract/ImageCanvas'
import {
  AxisCalibrator,
  type AxisCalibratorHandle,
} from '@/components/extract/AxisCalibrator'
import { ColorPicker } from '@/components/extract/ColorPicker'
import { CurveExtractor } from '@/components/extract/CurveExtractor'
import { DataTable } from '@/components/extract/DataTable'
import { OverlayVerifier } from '@/components/extract/OverlayVerifier'
import { PointEditor } from '@/components/extract/PointEditor'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useExtractStore } from '@/stores/extractStore'
import { useDatasetStore } from '@/stores/datasetStore'
import { useTranslation } from '@/lib/i18n'
import { db } from '@/services/db'
import { exportCSV, exportExcel, importCSV } from '@/services/exportService'
import type { Dataset } from '@/lib/types'

export default function ExtractPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const calibratorRef = useRef<AxisCalibratorHandle>(null)
  const canvasRef = useRef<ImageCanvasHandle>(null)
  const csvInputRef = useRef<HTMLInputElement>(null)
  const tool = useExtractStore((s) => s.tool)
  const image = useExtractStore((s) => s.image)
  const calibration = useExtractStore((s) => s.calibration)
  const editingPoints = useExtractStore((s) => s.editingPoints)
  const selectedColor = useExtractStore((s) => s.selectedColor)
  const undoStack = useExtractStore((s) => s.undoStack)
  const { setSelectedColor, setEditingPoints, selectPoint, undoLastMove } =
    useExtractStore((s) => s.actions)
  const { addDataset } = useDatasetStore((s) => s.actions)

  // Track canvas transform for overlay
  const [canvasZoom, setCanvasZoom] = useState(1)
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 })

  // Poll canvas transform periodically to sync with overlay
  const syncTransform = useCallback(() => {
    const handle = canvasRef.current
    if (!handle) return
    setCanvasZoom(handle.getZoom())
    setCanvasOffset(handle.getOffset())
  }, [])

  const handleCanvasClick = useCallback(
    (coord: { x: number; y: number }) => {
      if (tool === 'calibrate') {
        calibratorRef.current?.addPixelPoint(coord)
      } else if (tool === 'pick') {
        const color = canvasRef.current?.getPixelColor(coord.x, coord.y)
        if (color) {
          setSelectedColor(color)
        }
      }
      syncTransform()
    },
    [tool, setSelectedColor, syncTransform]
  )

  const getImageData = useCallback(() => {
    return canvasRef.current?.getImageData() ?? null
  }, [])

  // Export handlers
  const handleExportCSV = useCallback(() => {
    if (editingPoints.length === 0) return
    const name = image?.name?.replace(/\.[^.]+$/, '') ?? 'data'
    exportCSV(editingPoints, name)
  }, [editingPoints, image])

  const handleExportExcel = useCallback(() => {
    if (editingPoints.length === 0) return
    const name = image?.name?.replace(/\.[^.]+$/, '') ?? 'data'
    exportExcel(editingPoints, name)
  }, [editingPoints, image])

  const handleImportCSV = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      const points = await importCSV(file)
      if (points.length > 0) {
        setEditingPoints(points)
      }
      // Reset file input so the same file can be re-imported
      e.target.value = ''
    },
    [setEditingPoints]
  )

  // Save as Dataset
  const handleSaveDataset = useCallback(async () => {
    if (editingPoints.length === 0) return
    const dataset: Dataset = {
      id: crypto.randomUUID(),
      name: image?.name?.replace(/\.[^.]+$/, '') ?? 'Untitled',
      color: selectedColor ?? '#3b82f6',
      points: [...editingPoints],
      sourceType: 'extracted',
      sourceImageId: image?.id,
      calibration: calibration ?? undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    addDataset(dataset)
    await db.datasets.put(dataset)
  }, [editingPoints, image, selectedColor, calibration, addDataset])

  // Send to Plot: save dataset + navigate to /plot with dataset ID
  const handleSendToPlot = useCallback(async () => {
    if (editingPoints.length === 0) return
    const dataset: Dataset = {
      id: crypto.randomUUID(),
      name: image?.name?.replace(/\.[^.]+$/, '') ?? 'Untitled',
      color: selectedColor ?? '#3b82f6',
      points: [...editingPoints],
      sourceType: 'extracted',
      sourceImageId: image?.id,
      calibration: calibration ?? undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    addDataset(dataset)
    await db.datasets.put(dataset)
    router.push(`/plot?dataset=${dataset.id}`)
  }, [editingPoints, image, selectedColor, calibration, addDataset, router])

  // Sync overlay whenever mouse events occur on canvas area
  const handleCanvasAreaMouseMove = useCallback(() => {
    syncTransform()
  }, [syncTransform])

  // Ctrl+Z undo handler for drag operations
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault()
        undoLastMove()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undoLastMove])

  // Handle DataTable row click to select point on canvas
  const handleRowClick = useCallback(
    (index: number) => {
      selectPoint(index)
    },
    [selectPoint]
  )

  const hasPoints = editingPoints.length > 0

  // Collapsible panel state: track which panels are manually toggled
  // Key: tool id that maps to a panel ('calibrate' | 'pick' | 'draw')
  type PanelId = 'calibrate' | 'pick' | 'draw'
  const [manualExpand, setManualExpand] = useState<Record<PanelId, boolean>>({
    calibrate: false,
    pick: false,
    draw: false,
  })

  // When tool changes, reset manual overrides so only the active panel auto-expands
  useEffect(() => {
    setManualExpand({ calibrate: false, pick: false, draw: false })
  }, [tool])

  // A panel is expanded if it matches the active tool OR was manually toggled open
  const isPanelExpanded = useCallback(
    (panelId: PanelId) => {
      if (manualExpand[panelId]) return true
      return tool === panelId
    },
    [tool, manualExpand]
  )

  const togglePanel = useCallback((panelId: PanelId) => {
    setManualExpand((prev) => ({ ...prev, [panelId]: !prev[panelId] }))
  }, [])

  const panels = useMemo(
    () =>
      [
        { id: 'calibrate' as PanelId, titleKey: 'extract.calibration.title' as const },
        { id: 'pick' as PanelId, titleKey: 'extract.colorPicker.title' as const },
        { id: 'draw' as PanelId, titleKey: 'extract.curveExtractor.title' as const },
      ] as const,
    []
  )

  return (
    <main className="flex h-[calc(100vh-3rem)] gap-4 p-4">
      {/* Canvas area - 2/3 width */}
      <div className="flex flex-[2] min-w-0 flex-col gap-2">
        <div
          className="relative flex-1 min-h-0"
          onMouseMove={handleCanvasAreaMouseMove}
          onWheel={syncTransform}
        >
          <ImageCanvas ref={canvasRef} onCanvasClick={handleCanvasClick} />
          {/* Overlay verifier canvas positioned over ImageCanvas */}
          <OverlayVerifier zoom={canvasZoom} offset={canvasOffset} />
          {/* Point editor overlay for drag-edit (above verifier) */}
          <PointEditor zoom={canvasZoom} offset={canvasOffset} />
        </div>

        {/* Data Table below canvas */}
        {hasPoints && (
          <div className="max-h-[40%] min-h-0 overflow-y-auto">
            <DataTable onRowClick={handleRowClick} />
          </div>
        )}
      </div>

      {/* Control panel - 1/3 width */}
      <div className="flex-1 min-w-[280px] max-w-[400px] overflow-y-auto">
        <div className="flex flex-col gap-4">
          {/* Tool selector */}
          <div>
            <h2 className="mb-2 text-sm font-semibold">{t('extract.tools.title')}</h2>
            <ToolSelector />
          </div>

          {/* Collapsible panels */}
          {panels.map((panel) => {
            const expanded = isPanelExpanded(panel.id)
            const isActive = tool === panel.id
            return (
              <div
                key={panel.id}
                className={`rounded-md border-l-2 ${
                  isActive ? 'border-primary' : 'border-transparent'
                }`}
              >
                <button
                  type="button"
                  className="flex w-full items-center gap-1.5 px-2 py-1.5 text-sm font-semibold hover:bg-secondary/50 rounded-md transition-colors"
                  onClick={() => togglePanel(panel.id)}
                >
                  {expanded ? (
                    <ChevronDown className="h-4 w-4 shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 shrink-0" />
                  )}
                  {t(panel.titleKey)}
                </button>
                <div
                  className={`transition-all duration-300 ${
                    expanded
                      ? 'max-h-[2000px] opacity-100 overflow-visible'
                      : 'max-h-0 opacity-0 overflow-hidden'
                  }`}
                >
                  <div className="px-2 pb-2">
                    {panel.id === 'calibrate' && (
                      <AxisCalibrator ref={calibratorRef} />
                    )}
                    {panel.id === 'pick' && <ColorPicker />}
                    {panel.id === 'draw' && (
                      <CurveExtractor getImageData={getImageData} />
                    )}
                  </div>
                </div>
              </div>
            )
          })}

          {/* Export/Import toolbar */}
          {hasPoints && (
            <div>
              <h2 className="mb-2 text-sm font-semibold">{t('extract.exportImport.title')}</h2>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={handleExportCSV}>
                  {t('extract.exportImport.exportCSV')}
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportExcel}>
                  {t('extract.exportImport.exportExcel')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => csvInputRef.current?.click()}
                >
                  {t('extract.exportImport.importCSV')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={undoLastMove}
                  disabled={undoStack.length === 0}
                >
                  {t('extract.exportImport.undo')}
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
          )}

          {/* Save as Dataset */}
          {hasPoints && (
            <div className="flex flex-col gap-2">
              <Button onClick={handleSaveDataset}>
                {t('extract.saveDataset')}
              </Button>
              <Button
                onClick={handleSendToPlot}
                className="bg-green-600 text-white hover:bg-green-700"
              >
                {t('extract.sendToPlot')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

function ToolSelector() {
  const { t } = useTranslation()
  const tool = useExtractStore((s) => s.tool)
  const { setTool } = useExtractStore((s) => s.actions)

  const tools = [
    { id: 'select' as const, label: t('extract.tools.select') },
    { id: 'calibrate' as const, label: t('extract.tools.calibrate') },
    { id: 'pick' as const, label: t('extract.tools.colorPick') },
    { id: 'draw' as const, label: t('extract.tools.draw') },
  ]

  return (
    <div className="flex gap-1">
      {tools.map((t) => (
        <button
          key={t.id}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            tool === t.id
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
          onClick={() => setTool(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
