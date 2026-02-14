'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { useExtractStore } from '@/stores/extractStore'
import { dataToPixel } from '@/lib/calibration'

interface OverlayVerifierProps {
  /** The current zoom level of the parent canvas. */
  zoom: number
  /** The current pan offset of the parent canvas. */
  offset: { x: number; y: number }
}

/**
 * Draws an overlay polyline of the editing points on a transparent canvas
 * positioned absolutely over the ImageCanvas.
 */
export function OverlayVerifier({ zoom, offset }: OverlayVerifierProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const editingPoints = useExtractStore((s) => s.editingPoints)
  const calibration = useExtractStore((s) => s.calibration)
  const selectedColor = useExtractStore((s) => s.selectedColor)

  const [visible, setVisible] = useState(true)
  const [opacity, setOpacity] = useState(70)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (!visible || !calibration || editingPoints.length < 2) return

    // Sort points by X for a continuous polyline
    const sorted = [...editingPoints].sort((a, b) => a.x - b.x)

    // Convert data coordinates to pixel positions on the canvas
    const pixelPoints = sorted.map((dp) => {
      const pixel = dataToPixel(dp, calibration)
      return {
        x: pixel.x * zoom + offset.x,
        y: pixel.y * zoom + offset.y,
      }
    })

    ctx.save()
    ctx.globalAlpha = opacity / 100
    ctx.strokeStyle = selectedColor ?? '#3b82f6'
    ctx.lineWidth = 2
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'

    ctx.beginPath()
    ctx.moveTo(pixelPoints[0].x, pixelPoints[0].y)
    for (let i = 1; i < pixelPoints.length; i++) {
      ctx.lineTo(pixelPoints[i].x, pixelPoints[i].y)
    }
    ctx.stroke()
    ctx.restore()
  }, [editingPoints, calibration, selectedColor, visible, opacity, zoom, offset])

  useEffect(() => {
    draw()
  }, [draw])

  // Resize overlay canvas to match its container
  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const observer = new ResizeObserver(() => {
      canvas.width = container.clientWidth
      canvas.height = container.clientHeight
      draw()
    })
    observer.observe(container)
    return () => observer.disconnect()
  }, [draw])

  return (
    <>
      {/* Overlay canvas - positioned by parent via absolute positioning */}
      <div
        ref={containerRef}
        className="pointer-events-none absolute inset-0"
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0"
        />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <Button
          variant={visible ? 'default' : 'outline'}
          size="xs"
          onClick={() => setVisible(!visible)}
        >
          {visible ? 'Hide Overlay' : 'Show Overlay'}
        </Button>
        <div className="flex flex-1 items-center gap-2">
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            Opacity: {opacity}%
          </span>
          <Slider
            min={0}
            max={100}
            step={1}
            value={[opacity]}
            onValueChange={([v]) => setOpacity(v)}
            className="w-24"
          />
        </div>
      </div>
    </>
  )
}
