'use client'

import { useCallback, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useExtractStore } from '@/stores/extractStore'
import { extractCurve, hexToRgb } from '@/lib/extraction'

interface CurveExtractorProps {
  getImageData: () => ImageData | null
}

export function CurveExtractor({ getImageData }: CurveExtractorProps) {
  const selectedColor = useExtractStore((s) => s.selectedColor)
  const tolerance = useExtractStore((s) => s.tolerance)
  const calibration = useExtractStore((s) => s.calibration)
  const extractedPoints = useExtractStore((s) => s.extractedPoints)
  const { setExtractedPoints } = useExtractStore((s) => s.actions)

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
      const points = extractCurve(imageData, targetColor, tolerance, calibration)
      setExtractedPoints(points)
      setIsExtracting(false)
    }, 0)
  }, [selectedColor, tolerance, calibration, getImageData, setExtractedPoints])

  const handleClear = useCallback(() => {
    setExtractedPoints([])
  }, [setExtractedPoints])

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold">Curve Extraction</h3>

      {!canExtract && (
        <p className="text-xs text-muted-foreground">
          {!selectedColor && !calibration
            ? 'Select a color and calibrate axes first.'
            : !selectedColor
              ? 'Select a color from the image first.'
              : 'Calibrate the axes first.'}
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
            <span className="font-mono">{selectedColor.toUpperCase()}</span>
            <span className="text-muted-foreground">
              tol: {tolerance}
            </span>
          </div>

          <Button
            size="sm"
            onClick={handleExtract}
            disabled={isExtracting}
          >
            {isExtracting ? 'Extracting...' : 'Extract Curve'}
          </Button>
        </div>
      )}

      {extractedPoints.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="rounded-md border bg-muted/50 p-2 text-xs">
            <p className="font-medium">
              Extracted {extractedPoints.length} points
            </p>
            <p className="text-muted-foreground">
              X: [{extractedPoints[0].x.toFixed(2)},{' '}
              {extractedPoints[extractedPoints.length - 1].x.toFixed(2)}]
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleClear}>
            Clear Extraction
          </Button>
        </div>
      )}
    </div>
  )
}
