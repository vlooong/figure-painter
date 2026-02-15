'use client'

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useExtractStore } from '@/stores/extractStore'
import { useTranslation } from '@/lib/i18n'
import { useCanvasInteraction } from '@/hooks/useCanvasInteraction'
import { dataToPixel } from '@/lib/calibration'
import { findMatchingPixels, hexToRgb } from '@/lib/extraction'
import type { ImageRecord } from '@/lib/types'

export interface ImageCanvasHandle {
  /** Read the pixel color at image coordinates (x, y). Returns hex string. */
  getPixelColor: (x: number, y: number) => string | null
  /** Get the full ImageData of the original image (at native resolution). */
  getImageData: () => ImageData | null
  /** Get the current zoom level. */
  getZoom: () => number
  /** Get the current pan offset. */
  getOffset: () => { x: number; y: number }
}

interface ImageCanvasProps {
  onCanvasClick?: (coord: { x: number; y: number }) => void
}

export const ImageCanvas = forwardRef<ImageCanvasHandle, ImageCanvasProps>(
  function ImageCanvas({ onCanvasClick }, ref) {
  const { t } = useTranslation()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const image = useExtractStore((s) => s.image)
  const calibration = useExtractStore((s) => s.calibration)
  const selectedColor = useExtractStore((s) => s.selectedColor)
  const tolerance = useExtractStore((s) => s.tolerance)
  const extractedPoints = useExtractStore((s) => s.extractedPoints)
  const pendingCalibrationPoints = useExtractStore((s) => s.pendingCalibrationPoints)
  const { setImage } = useExtractStore((s) => s.actions)

  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const offsetStart = useRef({ x: 0, y: 0 })
  const resizeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Expose methods for color picking and extraction
  useImperativeHandle(
    ref,
    () => ({
      getPixelColor: (x: number, y: number) => {
        const img = imageRef.current
        if (!img) return null
        // Draw image to an offscreen canvas at native resolution to read exact pixel
        const offscreen = document.createElement('canvas')
        offscreen.width = img.width
        offscreen.height = img.height
        const ctx = offscreen.getContext('2d')
        if (!ctx) return null
        ctx.drawImage(img, 0, 0)
        const ix = Math.round(x)
        const iy = Math.round(y)
        if (ix < 0 || ix >= img.width || iy < 0 || iy >= img.height) return null
        const pixel = ctx.getImageData(ix, iy, 1, 1).data
        const toHex = (c: number) => c.toString(16).padStart(2, '0')
        return `#${toHex(pixel[0])}${toHex(pixel[1])}${toHex(pixel[2])}`
      },
      getImageData: () => {
        const img = imageRef.current
        if (!img) return null
        const offscreen = document.createElement('canvas')
        offscreen.width = img.width
        offscreen.height = img.height
        const ctx = offscreen.getContext('2d')
        if (!ctx) return null
        ctx.drawImage(img, 0, 0)
        return ctx.getImageData(0, 0, img.width, img.height)
      },
      getZoom: () => zoom,
      getOffset: () => offset,
    }),
    [zoom, offset]
  )

  // Reusable fit-to-view: centers and scales the image to fit the canvas
  const fitToView = useCallback(() => {
    const canvas = canvasRef.current
    const img = imageRef.current
    if (!canvas || !img || !canvas.width || !canvas.height) return

    const scaleX = canvas.width / img.width
    const scaleY = canvas.height / img.height
    const fitZoom = Math.min(scaleX, scaleY, 1)
    setZoom(fitZoom)
    setOffset({
      x: (canvas.width - img.width * fitZoom) / 2,
      y: (canvas.height - img.height * fitZoom) / 2,
    })
  }, [])

  const handleCanvasClickInternal = useCallback(
    (coord: { x: number; y: number }) => {
      // Transform from display coordinates back to image coordinates
      const imgX = (coord.x - offset.x) / zoom
      const imgY = (coord.y - offset.y) / zoom
      onCanvasClick?.({ x: imgX, y: imgY })
    },
    [onCanvasClick, zoom, offset]
  )

  const { mousePos, handleMouseDown, handleMouseUp, handleMouseMove, handleMouseLeave } =
    useCanvasInteraction(canvasRef, {
      onCanvasClick: handleCanvasClickInternal,
    })

  // Draw the image on the canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    const img = imageRef.current
    if (!canvas || !ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (img) {
      ctx.save()
      ctx.translate(offset.x, offset.y)
      ctx.scale(zoom, zoom)
      ctx.drawImage(img, 0, 0)
      ctx.restore()
    }

    // Draw calibration points
    // Draw pending calibration points
    if (pendingCalibrationPoints.length > 0) {
      ctx.save()
      ctx.strokeStyle = '#f97316'
      ctx.fillStyle = '#f97316'
      ctx.lineWidth = 2
      ctx.setLineDash([4, 3])
      pendingCalibrationPoints.forEach((pt, i) => {
        const px = pt.pixel.x * zoom + offset.x
        const py = pt.pixel.y * zoom + offset.y

        ctx.beginPath()
        ctx.moveTo(px - 8, py)
        ctx.lineTo(px + 8, py)
        ctx.moveTo(px, py - 8)
        ctx.lineTo(px, py + 8)
        ctx.stroke()

        ctx.font = '12px sans-serif'
        ctx.fillText('P' + (i + 1), px + 10, py - 4)
      })
      ctx.restore()
    }

    if (calibration?.points) {
      ctx.save()
      calibration.points.forEach((pt, i) => {
        const px = pt.pixel.x * zoom + offset.x
        const py = pt.pixel.y * zoom + offset.y

        // Crosshair
        ctx.strokeStyle = '#ef4444'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(px - 8, py)
        ctx.lineTo(px + 8, py)
        ctx.moveTo(px, py - 8)
        ctx.lineTo(px, py + 8)
        ctx.stroke()

        // Label
        ctx.fillStyle = '#ef4444'
        ctx.font = '12px sans-serif'
        ctx.fillText(t('extract.imageCanvas.pointLabel', { n: i + 1 }), px + 10, py - 4)
      })
      ctx.restore()
    }

    // Draw cursor coordinates
    if (mousePos && img) {
      const imgX = ((mousePos.x - offset.x) / zoom).toFixed(0)
      const imgY = ((mousePos.y - offset.y) / zoom).toFixed(0)
      ctx.save()
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
      ctx.fillRect(8, canvas.height - 28, 160, 22)
      ctx.fillStyle = '#ffffff'
      ctx.font = '12px monospace'
      ctx.fillText(t('extract.imageCanvas.pixelCoord', { x: imgX, y: imgY }), 14, canvas.height - 12)
      ctx.restore()
    }

    // Draw color match highlight overlay
    if (img && selectedColor) {
      const offscreen = document.createElement('canvas')
      offscreen.width = img.width
      offscreen.height = img.height
      const offCtx = offscreen.getContext('2d')
      if (offCtx) {
        offCtx.drawImage(img, 0, 0)
        const imgData = offCtx.getImageData(0, 0, img.width, img.height)
        const targetRgb = hexToRgb(selectedColor)
        const mask = findMatchingPixels(imgData, targetRgb, tolerance)

        // Create highlight image
        const highlightData = offCtx.createImageData(img.width, img.height)
        for (let i = 0; i < mask.length; i++) {
          if (mask[i]) {
            const idx = i * 4
            highlightData.data[idx] = 0       // R
            highlightData.data[idx + 1] = 255 // G
            highlightData.data[idx + 2] = 0   // B
            highlightData.data[idx + 3] = 100  // A (semi-transparent)
          }
        }
        offCtx.putImageData(highlightData, 0, 0)

        ctx.save()
        ctx.translate(offset.x, offset.y)
        ctx.scale(zoom, zoom)
        ctx.drawImage(offscreen, 0, 0)
        ctx.restore()
      }
    }

    // Draw extracted points as dots
    if (extractedPoints.length > 0 && calibration) {
      ctx.save()
      ctx.fillStyle = '#3b82f6'
      ctx.strokeStyle = '#1d4ed8'
      ctx.lineWidth = 1
      for (const dp of extractedPoints) {
        const pixel = dataToPixel(dp, calibration)
        const px = pixel.x * zoom + offset.x
        const py = pixel.y * zoom + offset.y
        ctx.beginPath()
        ctx.arc(px, py, 4, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
      }
      ctx.restore()
    }
  }, [zoom, offset, calibration, pendingCalibrationPoints, mousePos, selectedColor, tolerance, extractedPoints, t])

  useEffect(() => {
    draw()
  }, [draw])

  // Load image from file
  const loadImage = useCallback(
    (file: File) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          imageRef.current = img

          // Fit canvas to container
          const container = containerRef.current
          if (container) {
            const canvas = canvasRef.current
            if (canvas) {
              canvas.width = container.clientWidth
              canvas.height = container.clientHeight
            }
          }

          // Calculate initial zoom to fit image
          fitToView()

          // Create ImageRecord
          file.arrayBuffer().then((buffer) => {
            const blob = new Blob([buffer], { type: file.type })
            const record: ImageRecord = {
              id: crypto.randomUUID(),
              name: file.name,
              blob,
              width: img.width,
              height: img.height,
              createdAt: Date.now(),
            }
            setImage(record)
          })
        }
        img.src = e.target?.result as string
      }
      reader.readAsDataURL(file)
    },
    [setImage, fitToView]
  )

  // File input handler
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) loadImage(file)
    },
    [loadImage]
  )

  // Drag-and-drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const file = e.dataTransfer.files?.[0]
      if (file && file.type.startsWith('image/')) {
        loadImage(file)
      }
    },
    [loadImage]
  )

  // Zoom with mouse wheel
  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLCanvasElement>) => {
      e.preventDefault()
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const mouseX = (e.clientX - rect.left) * (canvas.width / rect.width)
      const mouseY = (e.clientY - rect.top) * (canvas.height / rect.height)

      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9
      const newZoom = Math.max(0.1, Math.min(zoom * zoomFactor, 20))

      // Zoom centered on mouse position
      const newOffsetX = mouseX - ((mouseX - offset.x) / zoom) * newZoom
      const newOffsetY = mouseY - ((mouseY - offset.y) / zoom) * newZoom

      setZoom(newZoom)
      setOffset({ x: newOffsetX, y: newOffsetY })
    },
    [zoom, offset]
  )

  // Pan with middle mouse button
  const handleMouseDownPan = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (e.button === 1) {
        e.preventDefault()
        setIsDragging(true)
        dragStart.current = { x: e.clientX, y: e.clientY }
        offsetStart.current = { ...offset }
        return
      }
      handleMouseDown(e)
    },
    [handleMouseDown, offset]
  )

  const handleMouseMovePan = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (isDragging) {
        const dx = e.clientX - dragStart.current.x
        const dy = e.clientY - dragStart.current.y
        setOffset({
          x: offsetStart.current.x + dx,
          y: offsetStart.current.y + dy,
        })
        return
      }
      handleMouseMove(e)
    },
    [isDragging, handleMouseMove]
  )

  const handleMouseUpPan = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (isDragging) {
        setIsDragging(false)
        return
      }
      handleMouseUp(e)
    },
    [isDragging, handleMouseUp]
  )

  // Resize canvas when container resizes
  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const observer = new ResizeObserver(() => {
      canvas.width = container.clientWidth
      canvas.height = container.clientHeight

      // Debounce fitToView to batch rapid resize events
      if (resizeTimerRef.current) {
        clearTimeout(resizeTimerRef.current)
      }
      resizeTimerRef.current = setTimeout(() => {
        fitToView()
      }, 100)

      // Immediate redraw to avoid blank flash
      draw()
    })
    observer.observe(container)
    return () => {
      observer.disconnect()
      if (resizeTimerRef.current) {
        clearTimeout(resizeTimerRef.current)
      }
    }
  }, [draw, fitToView])

  return (
    <div className="flex h-full flex-col gap-2">
      {!image && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            {t('extract.imageCanvas.uploadImage')}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      )}

      <div
        ref={containerRef}
        className="relative flex-1 overflow-hidden rounded-md border bg-muted"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {!image ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p className="text-lg">{t('extract.imageCanvas.dropHere')}</p>
              <p className="text-sm">{t('extract.imageCanvas.supportedFormats')}</p>
            </div>
          </div>
        ) : null}
        <canvas
          ref={canvasRef}
          className={cn(
            'absolute inset-0',
            isDragging ? 'cursor-grabbing' : 'cursor-crosshair'
          )}
          onMouseDown={handleMouseDownPan}
          onMouseUp={handleMouseUpPan}
          onMouseMove={handleMouseMovePan}
          onMouseLeave={handleMouseLeave}
          onWheel={handleWheel}
          onContextMenu={(e) => e.preventDefault()}
        />
      </div>

      {image && (
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>
            {image.name} ({image.width} x {image.height})
          </span>
          <span>{t('extract.imageCanvas.zoom', { value: (zoom * 100).toFixed(0) })}</span>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => {
              setImage(null)
              imageRef.current = null
              setZoom(1)
              setOffset({ x: 0, y: 0 })
            }}
          >
            {t('extract.imageCanvas.clear')}
          </Button>
        </div>
      )}
    </div>
  )
  }
)
