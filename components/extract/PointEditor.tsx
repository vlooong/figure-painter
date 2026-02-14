'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useExtractStore } from '@/stores/extractStore'
import { useCanvasInteraction } from '@/hooks/useCanvasInteraction'
import { dataToPixel, pixelToData } from '@/lib/calibration'

interface PointEditorProps {
  /** The current zoom level of the parent canvas. */
  zoom: number
  /** The current pan offset of the parent canvas. */
  offset: { x: number; y: number }
}

/**
 * Renders an overlay canvas over ImageCanvas showing draggable data points.
 * Active when tool === 'select' and there is a valid calibration and editing points.
 */
export function PointEditor({ zoom, offset }: PointEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const editingPoints = useExtractStore((s) => s.editingPoints)
  const calibration = useExtractStore((s) => s.calibration)
  const selectedPointIndex = useExtractStore((s) => s.selectedPointIndex)
  const tool = useExtractStore((s) => s.tool)
  const { movePoint, selectPoint, updatePoint } = useExtractStore((s) => s.actions)

  // Track position before drag for the final commit
  const dragStartData = useRef<{ x: number; y: number } | null>(null)

  // Convert editing points to pixel coordinates (canvas space) for hit-testing
  const pixelPoints = useMemo(() => {
    if (!calibration || editingPoints.length === 0) return []
    return editingPoints.map((dp) => {
      const pixel = dataToPixel(dp, calibration)
      return {
        x: pixel.x * zoom + offset.x,
        y: pixel.y * zoom + offset.y,
      }
    })
  }, [editingPoints, calibration, zoom, offset])

  // Clamp a data point to the calibrated axis bounds
  const clampToAxisBounds = useCallback(
    (dataX: number, dataY: number): { x: number; y: number } => {
      if (!calibration) return { x: dataX, y: dataY }
      const { xAxis, yAxis } = calibration
      const xMin = Math.min(xAxis.min, xAxis.max)
      const xMax = Math.max(xAxis.min, xAxis.max)
      const yMin = Math.min(yAxis.min, yAxis.max)
      const yMax = Math.max(yAxis.min, yAxis.max)
      return {
        x: Math.max(xMin, Math.min(xMax, dataX)),
        y: Math.max(yMin, Math.min(yMax, dataY)),
      }
    },
    [calibration]
  )

  // Convert canvas-space pixel to image-space pixel, then to data coordinates
  const canvasToData = useCallback(
    (canvasX: number, canvasY: number) => {
      if (!calibration) return null
      const imgX = (canvasX - offset.x) / zoom
      const imgY = (canvasY - offset.y) / zoom
      return pixelToData({ x: imgX, y: imgY }, calibration)
    },
    [calibration, zoom, offset]
  )

  // Handle drag move: update point position in real-time (via updatePoint for visual feedback)
  const handleDragMove = useCallback(
    (index: number, canvasCoord: { x: number; y: number }) => {
      const data = canvasToData(canvasCoord.x, canvasCoord.y)
      if (!data) return
      const clamped = clampToAxisBounds(data.x, data.y)
      // Use updatePoint for real-time visual feedback (does not push undo stack)
      updatePoint(index, { x: clamped.x, y: clamped.y })
    },
    [canvasToData, clampToAxisBounds, updatePoint]
  )

  // Handle drag end: commit via movePoint (pushes undo stack)
  const handleDragEnd = useCallback(
    (index: number, canvasCoord: { x: number; y: number }) => {
      const data = canvasToData(canvasCoord.x, canvasCoord.y)
      if (!data || !dragStartData.current) return
      const clamped = clampToAxisBounds(data.x, data.y)
      // Restore original point first then use movePoint to push undo and set final position
      const prev = dragStartData.current
      updatePoint(index, { x: prev.x, y: prev.y })
      movePoint(index, clamped.x, clamped.y)
      selectPoint(index)
      dragStartData.current = null
    },
    [canvasToData, clampToAxisBounds, updatePoint, movePoint, selectPoint]
  )

  // Handle click on a point (when not dragging)
  const handleCanvasClick = useCallback(
    (coord: { x: number; y: number }) => {
      // Check if click is near a point to select it
      if (!calibration || pixelPoints.length === 0) return
      const HIT_RADIUS = 8
      let bestDist = HIT_RADIUS
      let bestIndex = -1
      for (let i = 0; i < pixelPoints.length; i++) {
        const dx = coord.x - pixelPoints[i].x
        const dy = coord.y - pixelPoints[i].y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < bestDist) {
          bestDist = dist
          bestIndex = i
        }
      }
      selectPoint(bestIndex >= 0 ? bestIndex : null)
    },
    [calibration, pixelPoints, selectPoint]
  )

  const isActive = tool === 'select' && !!calibration && editingPoints.length > 0

  const dragOptions = useMemo(
    () =>
      isActive
        ? {
            points: pixelPoints,
            hitRadius: 8,
            onDragMove: handleDragMove,
            onDragEnd: handleDragEnd,
          }
        : undefined,
    [isActive, pixelPoints, handleDragMove, handleDragEnd]
  )

  const {
    handleMouseDown,
    handleMouseUp,
    handleMouseMove,
    handleMouseLeave,
    draggedIndex,
    isDragging,
    hoveredIndex,
  } = useCanvasInteraction(
    canvasRef,
    { onCanvasClick: handleCanvasClick },
    dragOptions
  )

  // Record drag start position when dragging begins
  useEffect(() => {
    if (isDragging && draggedIndex !== null && !dragStartData.current) {
      const pt = editingPoints[draggedIndex]
      if (pt) {
        dragStartData.current = { x: pt.x, y: pt.y }
      }
    }
    if (!isDragging) {
      dragStartData.current = null
    }
  }, [isDragging, draggedIndex, editingPoints])

  // Draw points overlay
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (!isActive) return

    for (let i = 0; i < pixelPoints.length; i++) {
      const pp = pixelPoints[i]
      const isSelected = i === selectedPointIndex
      const isHovered = i === hoveredIndex
      const isBeingDragged = isDragging && i === draggedIndex

      // Determine radius
      let radius = 6
      if (isHovered || isBeingDragged) radius = 8
      if (isSelected) radius = 10

      ctx.save()

      // Draw selection ring
      if (isSelected) {
        ctx.beginPath()
        ctx.arc(pp.x, pp.y, radius + 3, 0, Math.PI * 2)
        ctx.strokeStyle = '#f97316' // orange ring
        ctx.lineWidth = 2
        ctx.stroke()
      }

      // Draw point fill
      ctx.beginPath()
      ctx.arc(pp.x, pp.y, radius, 0, Math.PI * 2)
      if (isBeingDragged) {
        ctx.fillStyle = '#ef4444' // red while dragging
      } else if (isSelected) {
        ctx.fillStyle = '#f97316' // orange when selected
      } else if (isHovered) {
        ctx.fillStyle = '#60a5fa' // lighter blue on hover
      } else {
        ctx.fillStyle = '#3b82f6' // default blue
      }
      ctx.fill()

      // Draw border
      ctx.strokeStyle = '#1e3a5f'
      ctx.lineWidth = 1
      ctx.stroke()

      ctx.restore()
    }
  }, [
    isActive,
    pixelPoints,
    selectedPointIndex,
    hoveredIndex,
    isDragging,
    draggedIndex,
  ])

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

  // Determine cursor style
  const getCursorClass = () => {
    if (isDragging) return 'cursor-grabbing'
    if (hoveredIndex !== null) return 'cursor-grab'
    return 'cursor-crosshair'
  }

  if (!isActive) {
    return null
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
      style={{ zIndex: 10 }}
    >
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 ${getCursorClass()}`}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
    </div>
  )
}
