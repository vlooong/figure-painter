'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
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
import { useExtractStore } from '@/stores/extractStore'
import { useDatasetStore } from '@/stores/datasetStore'
import { db } from '@/services/db'
import { exportCSV, exportExcel, importCSV } from '@/services/exportService'
import type { Dataset } from '@/lib/types'

export default function ExtractPage() {
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
            <h2 className="mb-2 text-sm font-semibold">Tools</h2>
            <ToolSelector />
          </div>

          {/* Axis calibration */}
          <AxisCalibrator ref={calibratorRef} />

          {/* Color picker */}
          <ColorPicker />

          {/* Curve extraction */}
          <CurveExtractor getImageData={getImageData} />

          {/* Export/Import toolbar */}
          {hasPoints && (
            <div>
              <h2 className="mb-2 text-sm font-semibold">Export / Import</h2>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={handleExportCSV}>
                  Export CSV
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportExcel}>
                  Export Excel
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => csvInputRef.current?.click()}
                >
                  Import CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={undoLastMove}
                  disabled={undoStack.length === 0}
                >
                  Undo (Ctrl+Z)
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
                Save as Dataset
              </Button>
              <Button
                onClick={handleSendToPlot}
                className="bg-green-600 text-white hover:bg-green-700"
              >
                Send to Plot
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

function ToolSelector() {
  const tool = useExtractStore((s) => s.tool)
  const { setTool } = useExtractStore((s) => s.actions)

  const tools = [
    { id: 'select' as const, label: 'Select' },
    { id: 'calibrate' as const, label: 'Calibrate' },
    { id: 'pick' as const, label: 'Color Pick' },
    { id: 'draw' as const, label: 'Draw' },
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
