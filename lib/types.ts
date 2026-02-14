// ---- Data Point ----
export interface DataPoint {
  x: number
  y: number
  isInterpolated?: boolean
}

// ---- Axis Configuration ----
export interface AxisConfig {
  type: 'linear' | 'log'
  min: number
  max: number
  label?: string
  unit?: string
}

// ---- Calibration ----
export interface CalibrationPoint {
  pixel: { x: number; y: number }
  data: { x: number; y: number }
}

export interface Calibration {
  points: CalibrationPoint[]
  xAxis: AxisConfig
  yAxis: AxisConfig
}

// ---- Dataset ----
export interface Dataset {
  id: string
  name: string
  color: string
  points: DataPoint[]
  sourceType: 'extracted' | 'imported' | 'manual'
  sourceImageId?: string
  calibration?: Calibration
  createdAt: number
  updatedAt: number
}

// ---- Image Record ----
export interface ImageRecord {
  id: string
  name: string
  blob: Blob
  width: number
  height: number
  createdAt: number
}

// ---- Chart Template ----
export interface ChartTemplate {
  id: string
  name: string
  description: string
  fontFamily: string
  fontSize: {
    title: number
    axis: number
    legend: number
    tick: number
  }
  lineWidth: number
  colors: string[]
  axisStyle: {
    showGrid: boolean
    gridStyle: 'solid' | 'dashed' | 'dotted'
    tickInside: boolean
    boxFrame: boolean
  }
  dimensions: {
    width: number
    height: number
    dpi: number
  }
}

// ---- Plot Configuration ----
export interface PlotConfig {
  id: string
  title: string
  xAxis: AxisConfig
  yAxis: AxisConfig
  yAxis2?: AxisConfig
  datasetIds: string[]
  templateId: string
  customOverrides: Partial<ChartTemplate>
  createdAt: number
  updatedAt: number
}

// ---- Extraction State ----
export type ExtractTool = 'select' | 'pick' | 'calibrate' | 'draw'

export interface ExtractState {
  image: ImageRecord | null
  calibration: Calibration | null
  selectedColor: string | null
  tolerance: number
  extractedPoints: DataPoint[]
  editingPoints: DataPoint[]
  tool: ExtractTool
}
