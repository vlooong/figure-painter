import type { Calibration, DataPoint } from '@/lib/types'

/**
 * Convert pixel coordinates to data coordinates using calibration.
 * Requires at least 2 calibration points to determine pixel-to-data mapping.
 * Supports both linear and logarithmic axis scales.
 */
export function pixelToData(
  pixel: { x: number; y: number },
  calibration: Calibration
): DataPoint {
  const { points, xAxis, yAxis } = calibration

  // Determine pixel range from calibration points
  const pixelXs = points.map((p) => p.pixel.x)
  const pixelYs = points.map((p) => p.pixel.y)
  const dataXs = points.map((p) => p.data.x)
  const dataYs = points.map((p) => p.data.y)

  const xMinPixel = Math.min(...pixelXs)
  const xMaxPixel = Math.max(...pixelXs)
  const yMinPixel = Math.min(...pixelYs)
  const yMaxPixel = Math.max(...pixelYs)

  // Find data values at pixel extremes
  const xMinData = dataXs[pixelXs.indexOf(xMinPixel)]
  const xMaxData = dataXs[pixelXs.indexOf(xMaxPixel)]
  // Note: in screen coordinates, smaller Y is higher on screen (top),
  // which typically corresponds to larger data values
  const yMinPixelData = dataYs[pixelYs.indexOf(yMinPixel)]
  const yMaxPixelData = dataYs[pixelYs.indexOf(yMaxPixel)]

  const x = transformAxis(
    pixel.x,
    xMinPixel,
    xMaxPixel,
    xMinData,
    xMaxData,
    xAxis.type
  )

  const y = transformAxis(
    pixel.y,
    yMinPixel,
    yMaxPixel,
    yMinPixelData,
    yMaxPixelData,
    yAxis.type
  )

  return { x, y }
}

/**
 * Convert data coordinates back to pixel coordinates using calibration.
 */
export function dataToPixel(
  data: DataPoint,
  calibration: Calibration
): { x: number; y: number } {
  const { points, xAxis, yAxis } = calibration

  const pixelXs = points.map((p) => p.pixel.x)
  const pixelYs = points.map((p) => p.pixel.y)
  const dataXs = points.map((p) => p.data.x)
  const dataYs = points.map((p) => p.data.y)

  const xMinPixel = Math.min(...pixelXs)
  const xMaxPixel = Math.max(...pixelXs)
  const yMinPixel = Math.min(...pixelYs)
  const yMaxPixel = Math.max(...pixelYs)

  const xMinData = dataXs[pixelXs.indexOf(xMinPixel)]
  const xMaxData = dataXs[pixelXs.indexOf(xMaxPixel)]
  const yMinPixelData = dataYs[pixelYs.indexOf(yMinPixel)]
  const yMaxPixelData = dataYs[pixelYs.indexOf(yMaxPixel)]

  const px = inverseTransformAxis(
    data.x,
    xMinPixel,
    xMaxPixel,
    xMinData,
    xMaxData,
    xAxis.type
  )

  const py = inverseTransformAxis(
    data.y,
    yMinPixel,
    yMaxPixel,
    yMinPixelData,
    yMaxPixelData,
    yAxis.type
  )

  return { x: px, y: py }
}

/**
 * Transform a single axis value from pixel to data space.
 */
function transformAxis(
  pixel: number,
  pixelMin: number,
  pixelMax: number,
  dataAtPixelMin: number,
  dataAtPixelMax: number,
  type: 'linear' | 'log'
): number {
  if (pixelMax === pixelMin) return dataAtPixelMin

  const t = (pixel - pixelMin) / (pixelMax - pixelMin)

  if (type === 'log') {
    if (dataAtPixelMin <= 0 || dataAtPixelMax <= 0) {
      return dataAtPixelMin + t * (dataAtPixelMax - dataAtPixelMin)
    }
    return dataAtPixelMin * Math.pow(dataAtPixelMax / dataAtPixelMin, t)
  }

  return dataAtPixelMin + t * (dataAtPixelMax - dataAtPixelMin)
}

/**
 * Transform a single axis value from data to pixel space (inverse).
 */
function inverseTransformAxis(
  data: number,
  pixelMin: number,
  pixelMax: number,
  dataAtPixelMin: number,
  dataAtPixelMax: number,
  type: 'linear' | 'log'
): number {
  if (dataAtPixelMax === dataAtPixelMin) return pixelMin

  let t: number

  if (type === 'log') {
    if (dataAtPixelMin <= 0 || dataAtPixelMax <= 0 || data <= 0) {
      t = (data - dataAtPixelMin) / (dataAtPixelMax - dataAtPixelMin)
    } else {
      t =
        Math.log(data / dataAtPixelMin) /
        Math.log(dataAtPixelMax / dataAtPixelMin)
    }
  } else {
    t = (data - dataAtPixelMin) / (dataAtPixelMax - dataAtPixelMin)
  }

  return pixelMin + t * (pixelMax - pixelMin)
}
