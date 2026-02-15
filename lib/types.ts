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

// ---- Advanced Chart Configuration ----
export interface AdvancedConfig {
  // Data Points
  showSymbol?: boolean
  symbolSize?: number
  symbolShape?: 'circle' | 'rect' | 'triangle' | 'diamond' | 'none'
  // Legend
  legendPosition?: 'top' | 'bottom' | 'left' | 'right'
  legendVisible?: boolean
  legendOrientation?: 'horizontal' | 'vertical'
  // Grid Lines
  showGridLines?: boolean
  gridLineStyle?: 'solid' | 'dashed' | 'dotted'
  // Line Style
  lineWidth?: number
  lineType?: 'solid' | 'dashed' | 'dotted'
  smooth?: boolean
  // Axis Labels
  axisFontSize?: number
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
  advancedConfig?: AdvancedConfig
  createdAt: number
  updatedAt: number
}

// ---- Benchmark ----
export interface TaskCategory {
  id: string
  name: string
  nameZh: string
}

export interface BenchmarkDataset {
  id: string
  name: string
  fullName: string
  fullNameZh: string
  domain: string
  domainZh: string
  taskIds: string[]
  description: string
  descriptionZh: string
  features?: number
  frequency?: string
  source?: string
}

export interface BenchmarkTable {
  datasetId: string
  taskId: string
  metricNames: string[]
  lowerIsBetter: boolean[]
  settingLabel: string
  settingLabelZh: string
  settings: BenchmarkSetting[]
}

export interface BenchmarkSetting {
  name: string
  results: BenchmarkResult[]
}

export interface BenchmarkResult {
  algorithm: string
  values: (number | null)[]
  paper?: string
  year?: number
}

// ---- Extraction State ----
export type ExtractTool = 'select' | 'pick' | 'calibrate' | 'draw'

export interface ExtractState {
  image: ImageRecord | null
  calibration: Calibration | null
  selectedColor: string | null
  tolerance: number
  sampleStep: number
  extractedPoints: DataPoint[]
  editingPoints: DataPoint[]
  tool: ExtractTool
}
