'use client'

import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useExtractStore } from '@/stores/extractStore'
import { useTranslation } from '@/lib/i18n'
import { extractCurve, hexToRgb } from '@/lib/extraction'

interface CurveExtractorProps {
  getImageData: () => ImageData | null
}

export function CurveExtractor({ getImageData }: CurveExtractorProps) {
  const { t } = useTranslation()
  const selectedColor = useExtractStore((s) => s.selectedColor)
  const tolerance = useExtractStore((s) => s.tolerance)
  const sampleStep = useExtractStore((s) => s.sampleStep)
  const calibration = useExtractStore((s) => s.calibration)
  const extractedPoints = useExtractStore((s) => s.extractedPoints)
  const drawMode = useExtractStore((s) => s.drawMode)
  const drawnNodes = useExtractStore((s) => s.drawnNodes)
  const {
    setExtractedPoints,
    setDrawMode,
    commitDrawnNodes,
    clearDrawnNodes,
    removeLastDrawnNode,
  } = useExtractStore((s) => s.actions)

  const [isExtracting, setIsExtracting] = useState(false)

  const canExtract = selectedColor !== null && calibration !== null

  const handleExtract = useCallback(() => {
    if (!selectedColor || !calibration) return

    const imageData = getImageData()
    if (!imageData) return

    setIsExtracting(true)

    // Use setTimeout to let the UI update before blocking computation
    setTimeout(() => {
      const targetColor = hexToRgb(selectedColor)
      const points = extractCurve(imageData, targetColor, tolerance, calibration, sampleStep)
      setExtractedPoints(points)
      setIsExtracting(false)
    }, 0)
  }, [selectedColor, tolerance, sampleStep, calibration, getImageData, setExtractedPoints])

  // Auto re-extract when tolerance or sampleStep changes (debounced)
  useEffect(() => {
    if (!selectedColor || !calibration) return

    const timer = setTimeout(() => {
      handleExtract()
    }, 300)

    return () => clearTimeout(timer)
  }, [tolerance, sampleStep, selectedColor, calibration, handleExtract])

  const handleClear = useCallback(() => {
    setExtractedPoints([])
  }, [setExtractedPoints])

  return (
    <div className="flex flex-col gap-3">
      {/* Mode toggle */}
      <div className="flex gap-1">
        <button
          type="button"
          className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
            drawMode === 'auto'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
          onClick={() => setDrawMode('auto')}
        >
          {t('extract.curveExtractor.modeAuto')}
        </button>
        <button
          type="button"
          className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
            drawMode === 'manual'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
          onClick={() => setDrawMode('manual')}
        >
          {t('extract.curveExtractor.modeManual')}
        </button>
      </div>

      {/* Auto mode */}
      {drawMode === 'auto' && (
        <>
          {!canExtract && (
            <p className="text-xs text-muted-foreground">
              {!selectedColor && !calibration
                ? t('extract.curveExtractor.selectColorAndCalibrate')
                : !selectedColor
                  ? t('extract.curveExtractor.selectColorFirst')
                  : t('extract.curveExtractor.calibrateFirst')}
            </p>
          )}

          {canExtract && (
            <div className="flex flex-col gap-2">
              {/* Selected color summary */}
              <div className="flex items-center gap-2 text-xs">
                <div
                  className="size-4 shrink-0 rounded border"
                  style={{ backgroundColor: selectedColor }}
                />
                <span className="font-mono">{selectedColor!.toUpperCase()}</span>
                <span className="text-muted-foreground">
                  {t('extract.curveExtractor.tolerance')}{tolerance}
                </span>
              </div>

              <Button
                size="sm"
                onClick={handleExtract}
                disabled={isExtracting}
              >
                {isExtracting ? t('extract.curveExtractor.extracting') : t('extract.curveExtractor.extractCurve')}
              </Button>
            </div>
          )}
        </>
      )}

      {/* Manual mode */}
      {drawMode === 'manual' && (
        <div className="flex flex-col gap-2">
          {!calibration ? (
            <p className="text-xs text-muted-foreground">
              {t('extract.curveExtractor.calibrateFirst')}
            </p>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">
                {t('extract.curveExtractor.drawInstruction')}
              </p>
              <div className="rounded-md border bg-muted/50 p-2 text-xs font-medium">
                {t('extract.curveExtractor.drawnNodes', { n: drawnNodes.length })}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={removeLastDrawnNode}
                  disabled={drawnNodes.length === 0}
                >
                  {t('extract.curveExtractor.undoLastNode')}
                </Button>
                <Button
                  size="sm"
                  onClick={commitDrawnNodes}
                  disabled={drawnNodes.length < 2 || !calibration}
                >
                  {t('extract.curveExtractor.commitDraw')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearDrawnNodes}
                  disabled={drawnNodes.length === 0}
                >
                  {t('extract.curveExtractor.clearDraw')}
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Extracted points summary (shared between modes) */}
      {extractedPoints.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="rounded-md border bg-muted/50 p-2 text-xs">
            <p className="font-medium">
              {t('extract.curveExtractor.extractedPoints', { n: extractedPoints.length })}
            </p>
            <p className="text-muted-foreground">
              X: [{extractedPoints[0].x.toFixed(2)},{' '}
              {extractedPoints[extractedPoints.length - 1].x.toFixed(2)}]
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleClear}>
            {t('extract.curveExtractor.clearExtraction')}
          </Button>
        </div>
      )}
    </div>
  )
}
