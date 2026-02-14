'use client'

import { useCallback, useRef, useState } from 'react'

interface CanvasCoord {
  x: number
  y: number
}

interface PixelPoint {
  x: number
  y: number
}

type DragState = 'idle' | 'hovering' | 'dragging'

interface UseCanvasInteractionOptions {
  onCanvasClick?: (coord: CanvasCoord) => void
  onCanvasHover?: (coord: CanvasCoord) => void
}

interface DragOptions {
  /** Points in pixel coordinates (canvas space, already accounting for zoom/offset). */
  points: PixelPoint[]
  /** Hit-test radius in canvas pixels. Default 8. */
  hitRadius?: number
  /** Called while dragging with the new canvas-space position. */
  onDragMove?: (index: number, canvasCoord: CanvasCoord) => void
  /** Called when a drag completes. */
  onDragEnd?: (index: number, canvasCoord: CanvasCoord) => void
}

interface UseCanvasInteractionReturn {
  mousePos: CanvasCoord | null
  isClicking: boolean
  handleMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void
  handleMouseUp: (e: React.MouseEvent<HTMLCanvasElement>) => void
  handleMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void
  handleMouseLeave: () => void
  // Drag state
  draggedIndex: number | null
  isDragging: boolean
  hoveredIndex: number | null
}

function getCanvasCoord(
  e: React.MouseEvent<HTMLCanvasElement>,
  canvas: HTMLCanvasElement
): CanvasCoord {
  const rect = canvas.getBoundingClientRect()
  const scaleX = canvas.width / rect.width
  const scaleY = canvas.height / rect.height
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY,
  }
}

/**
 * Hit-test: returns the index of the nearest point within radius, or -1 if none.
 */
function hitTest(
  mousePos: CanvasCoord,
  points: PixelPoint[],
  radius: number
): number {
  let bestDist = radius
  let bestIndex = -1
  for (let i = 0; i < points.length; i++) {
    const dx = mousePos.x - points[i].x
    const dy = mousePos.y - points[i].y
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < bestDist) {
      bestDist = dist
      bestIndex = i
    }
  }
  return bestIndex
}

export function useCanvasInteraction(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  options: UseCanvasInteractionOptions = {},
  dragOptions?: DragOptions
): UseCanvasInteractionReturn {
  const [mousePos, setMousePos] = useState<CanvasCoord | null>(null)
  const [isClicking, setIsClicking] = useState(false)
  const mouseDownPos = useRef<CanvasCoord | null>(null)

  // Drag state
  const [dragState, setDragState] = useState<DragState>('idle')
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const lastMoveTime = useRef(0)

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current) return
      const coord = getCanvasCoord(e, canvasRef.current)
      mouseDownPos.current = coord
      setIsClicking(true)

      // Check for drag start on a point
      if (dragOptions?.points && dragOptions.points.length > 0) {
        const radius = dragOptions.hitRadius ?? 8
        const idx = hitTest(coord, dragOptions.points, radius)
        if (idx >= 0) {
          setDragState('dragging')
          setDraggedIndex(idx)
          return // Don't propagate as a regular click start
        }
      }
    },
    [canvasRef, dragOptions]
  )

  const handleMouseUp = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current) return
      const coord = getCanvasCoord(e, canvasRef.current)

      // Handle drag end
      if (dragState === 'dragging' && draggedIndex !== null) {
        dragOptions?.onDragEnd?.(draggedIndex, coord)
        setDragState('idle')
        setDraggedIndex(null)
        setIsClicking(false)
        mouseDownPos.current = null
        return
      }

      setIsClicking(false)

      // Only trigger click if mouse didn't move significantly (threshold: 4px)
      if (mouseDownPos.current) {
        const dx = coord.x - mouseDownPos.current.x
        const dy = coord.y - mouseDownPos.current.y
        if (Math.sqrt(dx * dx + dy * dy) < 4) {
          options.onCanvasClick?.(coord)
        }
      }
      mouseDownPos.current = null
    },
    [canvasRef, options, dragState, draggedIndex, dragOptions]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current) return
      const coord = getCanvasCoord(e, canvasRef.current)
      setMousePos(coord)

      // Handle active drag - throttle to 16ms (~60fps)
      if (dragState === 'dragging' && draggedIndex !== null) {
        const now = performance.now()
        if (now - lastMoveTime.current >= 16) {
          lastMoveTime.current = now
          dragOptions?.onDragMove?.(draggedIndex, coord)
        }
        return
      }

      // Hit-test for hover indication
      if (dragOptions?.points && dragOptions.points.length > 0) {
        const radius = dragOptions.hitRadius ?? 8
        const idx = hitTest(coord, dragOptions.points, radius)
        setHoveredIndex(idx >= 0 ? idx : null)
        if (idx >= 0 && dragState !== 'hovering') {
          setDragState('hovering')
        } else if (idx < 0 && dragState === 'hovering') {
          setDragState('idle')
        }
      }

      options.onCanvasHover?.(coord)
    },
    [canvasRef, options, dragState, draggedIndex, dragOptions]
  )

  const handleMouseLeave = useCallback(() => {
    setMousePos(null)
    setIsClicking(false)
    mouseDownPos.current = null

    // Cancel drag on leave
    if (dragState === 'dragging' && draggedIndex !== null) {
      // Don't commit - the drag is cancelled
      setDragState('idle')
      setDraggedIndex(null)
    }
    setHoveredIndex(null)
    setDragState('idle')
  }, [dragState, draggedIndex])

  return {
    mousePos,
    isClicking,
    handleMouseDown,
    handleMouseUp,
    handleMouseMove,
    handleMouseLeave,
    draggedIndex,
    isDragging: dragState === 'dragging',
    hoveredIndex,
  }
}
