import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import type { DataPoint } from '@/lib/types'

/**
 * Export data points as a CSV file using PapaParse.
 */
export function exportCSV(points: DataPoint[], filename: string): void {
  const csv = Papa.unparse({
    fields: ['x', 'y'],
    data: points.map((p) => [p.x, p.y]),
  })
  downloadBlob(csv, `${filename}.csv`, 'text/csv;charset=utf-8;')
}

/**
 * Export data points as an Excel (.xlsx) file using the xlsx library.
 */
export function exportExcel(points: DataPoint[], filename: string): void {
  const wsData = [['x', 'y'], ...points.map((p) => [p.x, p.y])]
  const ws = XLSX.utils.aoa_to_sheet(wsData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Data')
  XLSX.writeFile(wb, `${filename}.xlsx`)
}

/**
 * Import data points from a CSV file using PapaParse.
 * Expects columns named 'x' and 'y' (case-insensitive header row).
 */
export function importCSV(file: File): Promise<DataPoint[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        const points: DataPoint[] = []
        for (const row of results.data) {
          const x = Number(row['x'] ?? row['X'])
          const y = Number(row['y'] ?? row['Y'])
          if (!Number.isNaN(x) && !Number.isNaN(y)) {
            points.push({ x, y })
          }
        }
        resolve(points)
      },
      error: (err) => {
        reject(new Error(`CSV parse error: ${err.message}`))
      },
    })
  })
}

/**
 * Trigger a file download in the browser via Blob + anchor click.
 */
function downloadBlob(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}

/**
 * Export chart as PNG from a data URL.
 * Handles both canvas-based (base64 PNG) and SVG-based data URLs
 * by rendering SVG onto a canvas when needed.
 */
export function exportChartPNG(
  dataURL: string,
  filename: string,
  width?: number,
  height?: number,
): void {
  if (dataURL.startsWith('data:image/png')) {
    // Canvas renderer: already a PNG data URL
    downloadDataURL(dataURL, `${filename}.png`)
    return
  }

  // SVG renderer: render SVG onto a canvas to produce PNG
  const img = new Image()
  img.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = width ?? img.naturalWidth
    canvas.height = height ?? img.naturalHeight
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    const pngDataURL = canvas.toDataURL('image/png')
    downloadDataURL(pngDataURL, `${filename}.png`)
  }
  img.src = dataURL
}

/**
 * Export chart as SVG from a base64 data URL.
 * Extracts the SVG content and triggers download.
 */
export function exportChartSVG(dataURL: string, filename: string): void {
  // SVG data URLs from ECharts use base64 encoding
  if (dataURL.startsWith('data:image/svg+xml;base64,')) {
    const base64 = dataURL.split(',')[1]
    const svgContent = atob(base64)
    downloadBlob(svgContent, `${filename}.svg`, 'image/svg+xml;charset=utf-8')
  } else if (dataURL.startsWith('data:image/svg+xml')) {
    // Handle URL-encoded SVG
    const svgContent = decodeURIComponent(dataURL.split(',')[1])
    downloadBlob(svgContent, `${filename}.svg`, 'image/svg+xml;charset=utf-8')
  } else {
    // Fallback: treat as direct download
    downloadDataURL(dataURL, `${filename}.svg`)
  }
}

/**
 * Download a base64 data URL as a file by converting to Blob.
 */
function downloadDataURL(dataURL: string, filename: string): void {
  const parts = dataURL.split(',')
  const mimeMatch = parts[0].match(/:(.*?);/)
  const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream'
  const base64 = parts[1]
  const binaryStr = atob(base64)
  const bytes = new Uint8Array(binaryStr.length)
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i)
  }
  const blob = new Blob([bytes], { type: mime })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}
