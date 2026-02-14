import type { Calibration, DataPoint } from '@/lib/types'
import { pixelToData } from '@/lib/calibration'

interface TargetColor {
  r: number
  g: number
  b: number
}

/**
 * Compute RGB Euclidean distance between two colors.
 */
function colorDistance(
  r1: number,
  g1: number,
  b1: number,
  r2: number,
  g2: number,
  b2: number
): number {
  const dr = r1 - r2
  const dg = g1 - g2
  const db = b1 - b2
  return Math.sqrt(dr * dr + dg * dg + db * db)
}

/**
 * Compute the median of an array of numbers.
 */
function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2
  }
  return sorted[mid]
}

/**
 * Remove outlier points using a 3-sigma rolling window filter.
 * Points whose Y value deviates more than 3 standard deviations from
 * the rolling window mean are excluded.
 */
function removeOutliers(
  points: DataPoint[],
  windowSize: number = 11
): DataPoint[] {
  if (points.length < windowSize) return points

  const halfWindow = Math.floor(windowSize / 2)
  const result: DataPoint[] = []

  for (let i = 0; i < points.length; i++) {
    const start = Math.max(0, i - halfWindow)
    const end = Math.min(points.length, i + halfWindow + 1)
    const window = points.slice(start, end)

    const yValues = window.map((p) => p.y)
    const mean = yValues.reduce((s, v) => s + v, 0) / yValues.length
    const variance =
      yValues.reduce((s, v) => s + (v - mean) ** 2, 0) / yValues.length
    const sigma = Math.sqrt(variance)

    if (sigma === 0 || Math.abs(points[i].y - mean) <= 3 * sigma) {
      result.push(points[i])
    }
  }

  return result
}

/**
 * Extract a curve from image data by scanning each column for pixels
 * matching the target color within the given tolerance.
 *
 * Algorithm:
 * 1. For each column x (0..width-1), scan all rows y (0..height-1)
 * 2. Compute RGB Euclidean distance between pixel and target color
 * 3. If distance < tolerance, collect y into matchedYs
 * 4. If matchedYs not empty, compute medianY
 * 5. Convert (x, medianY) to data coordinates via pixelToData
 * 6. Post-process with removeOutliers using 3-sigma rolling window
 */
export function extractCurve(
  imageData: ImageData,
  targetColor: TargetColor,
  tolerance: number,
  calibration: Calibration
): DataPoint[] {
  const { width, height, data } = imageData
  const rawPoints: DataPoint[] = []

  for (let x = 0; x < width; x++) {
    const matchedYs: number[] = []

    for (let y = 0; y < height; y++) {
      const idx = (y * width + x) * 4
      const r = data[idx]
      const g = data[idx + 1]
      const b = data[idx + 2]

      const dist = colorDistance(
        r,
        g,
        b,
        targetColor.r,
        targetColor.g,
        targetColor.b
      )

      if (dist < tolerance) {
        matchedYs.push(y)
      }
    }

    if (matchedYs.length > 0) {
      const medianY = median(matchedYs)
      const dataPoint = pixelToData({ x, y: medianY }, calibration)
      rawPoints.push(dataPoint)
    }
  }

  return removeOutliers(rawPoints)
}

/**
 * Find all pixels in the image that match the target color within tolerance.
 * Returns a boolean mask (Uint8Array) where 1 = matched, 0 = not matched.
 * Used for rendering the highlight overlay.
 */
export function findMatchingPixels(
  imageData: ImageData,
  targetColor: TargetColor,
  tolerance: number
): Uint8Array {
  const { width, height, data } = imageData
  const mask = new Uint8Array(width * height)

  for (let i = 0; i < width * height; i++) {
    const idx = i * 4
    const r = data[idx]
    const g = data[idx + 1]
    const b = data[idx + 2]

    const dist = colorDistance(
      r,
      g,
      b,
      targetColor.r,
      targetColor.g,
      targetColor.b
    )

    if (dist < tolerance) {
      mask[i] = 1
    }
  }

  return mask
}

/**
 * Parse a hex color string (#RRGGBB) to RGB components.
 */
export function hexToRgb(hex: string): TargetColor {
  const clean = hex.replace('#', '')
  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16),
  }
}

/**
 * Convert RGB components to hex string (#RRGGBB).
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (c: number) => c.toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}
