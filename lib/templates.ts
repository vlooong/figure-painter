import type { ChartTemplate } from '@/lib/types'

// ---- Color Palettes ----

// Paul Tol's color-blind safe palettes
// https://personal.sron.nl/~pault/
const VIBRANT_COLORS = [
  '#EE7733', // orange
  '#0077BB', // blue
  '#33BBEE', // cyan
  '#EE3377', // magenta
  '#CC3311', // red
  '#009988', // teal
  '#BBBBBB', // grey
]

const MUTED_COLORS = [
  '#CC6677', // rose
  '#332288', // indigo
  '#DDCC77', // sand
  '#117733', // green
  '#88CCEE', // cyan
  '#882255', // wine
  '#44AA99', // teal
  '#999933', // olive
  '#AA4499', // purple
  '#DDDDDD', // pale grey
]

const HIGH_CONTRAST_COLORS = [
  '#004488', // dark blue
  '#DDAA33', // yellow
  '#BB5566', // red
]

// Style-specific palettes
const CORAL_TEAL_COLORS = [
  '#E64B35', // red
  '#4DBBD5', // cyan
  '#00A087', // teal
  '#3C5488', // navy
  '#F39B7F', // salmon
  '#8491B4', // slate blue
  '#91D1C2', // mint
  '#DC0000', // crimson
]

const CLASSIC_BLUE_COLORS = [
  '#0072BD', // blue
  '#D95319', // orange
  '#EDB120', // gold
  '#7E2F8E', // purple
  '#77AC30', // green
  '#4DBEEE', // light blue
]

const BOLD_PRIMARY_COLORS = [
  '#0C5DA5', // blue
  '#FF2C00', // red
  '#00B945', // green
  '#FF9500', // orange
  '#845B97', // purple
  '#474747', // dark gray
]

const MINIMAL_CHIC_COLORS = [
  '#0C5DA5', // blue
  '#FF2C00', // red
  '#00B945', // green
  '#FF9500', // orange
  '#845B97', // purple
  '#C20078', // magenta
]

// ---- Template Definitions ----

const defaultTemplate: ChartTemplate = {
  id: 'default',
  name: 'Default',
  description: 'Clean general-purpose style with standard colors',
  fontFamily: 'Arial, Helvetica, sans-serif',
  fontSize: { title: 14, axis: 12, legend: 10, tick: 10 },
  lineWidth: 1.5,
  colors: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272'],
  axisStyle: {
    showGrid: true,
    gridStyle: 'dashed',
    tickInside: false,
    boxFrame: false,
  },
  dimensions: { width: 800, height: 600, dpi: 150 },
}

const natureTemplate: ChartTemplate = {
  id: 'nature',
  name: 'Coral Teal',
  description: 'Warm coral and cool teal tones, compact layout',
  fontFamily: 'Arial, Helvetica, sans-serif',
  fontSize: { title: 8, axis: 7, legend: 6, tick: 6 },
  lineWidth: 1,
  colors: CORAL_TEAL_COLORS,
  axisStyle: {
    showGrid: false,
    gridStyle: 'solid',
    tickInside: true,
    boxFrame: true,
  },
  // Compact: 340x300 at 300 DPI
  dimensions: { width: 340, height: 300, dpi: 300 },
}

const ieeeTemplate: ChartTemplate = {
  id: 'ieee',
  name: 'Classic Blue',
  description: 'Traditional blue-orange palette with serif fonts',
  fontFamily: '"Times New Roman", Times, serif',
  fontSize: { title: 9, axis: 8, legend: 7, tick: 7 },
  lineWidth: 1,
  colors: CLASSIC_BLUE_COLORS,
  axisStyle: {
    showGrid: true,
    gridStyle: 'dotted',
    tickInside: false,
    boxFrame: false,
  },
  // Narrow column: 336x252 at 600 DPI
  dimensions: { width: 336, height: 252, dpi: 600 },
}

const acsTemplate: ChartTemplate = {
  id: 'acs',
  name: 'Bold Primary',
  description: 'Strong primary colors with box framing',
  fontFamily: 'Arial, Helvetica, sans-serif',
  fontSize: { title: 9, axis: 8, legend: 7, tick: 7 },
  lineWidth: 1.5,
  colors: BOLD_PRIMARY_COLORS,
  axisStyle: {
    showGrid: false,
    gridStyle: 'solid',
    tickInside: true,
    boxFrame: true,
  },
  // Compact column: 312x234 at 300 DPI
  dimensions: { width: 312, height: 234, dpi: 300 },
}

const scienceTemplate: ChartTemplate = {
  id: 'science',
  name: 'Minimal Chic',
  description: 'Minimal fine lines with refined color accents',
  fontFamily: 'Helvetica, Arial, sans-serif',
  fontSize: { title: 7, axis: 6, legend: 6, tick: 5 },
  lineWidth: 0.75,
  colors: MINIMAL_CHIC_COLORS,
  axisStyle: {
    showGrid: false,
    gridStyle: 'solid',
    tickInside: true,
    boxFrame: true,
  },
  // Minimal: 340x255 at 300 DPI
  dimensions: { width: 340, height: 255, dpi: 300 },
}

const vibrantTemplate: ChartTemplate = {
  id: 'vibrant',
  name: 'Vibrant',
  description: 'Color-blind safe with high visibility',
  fontFamily: 'Arial, Helvetica, sans-serif',
  fontSize: { title: 12, axis: 10, legend: 9, tick: 9 },
  lineWidth: 1.5,
  colors: VIBRANT_COLORS,
  axisStyle: {
    showGrid: true,
    gridStyle: 'dashed',
    tickInside: false,
    boxFrame: false,
  },
  dimensions: { width: 600, height: 450, dpi: 300 },
}

const mutedTemplate: ChartTemplate = {
  id: 'muted',
  name: 'Muted',
  description: 'Soft tones for multi-dataset figures',
  fontFamily: 'Arial, Helvetica, sans-serif',
  fontSize: { title: 11, axis: 9, legend: 8, tick: 8 },
  lineWidth: 1.2,
  colors: MUTED_COLORS,
  axisStyle: {
    showGrid: true,
    gridStyle: 'dotted',
    tickInside: false,
    boxFrame: false,
  },
  dimensions: { width: 600, height: 450, dpi: 300 },
}

const highContrastTemplate: ChartTemplate = {
  id: 'highContrast',
  name: 'High Contrast',
  description: 'Bold lines for print and grayscale',
  fontFamily: 'Arial, Helvetica, sans-serif',
  fontSize: { title: 12, axis: 10, legend: 9, tick: 9 },
  lineWidth: 2,
  colors: HIGH_CONTRAST_COLORS,
  axisStyle: {
    showGrid: false,
    gridStyle: 'solid',
    tickInside: true,
    boxFrame: true,
  },
  dimensions: { width: 600, height: 450, dpi: 600 },
}

// ---- Exports ----

export const TEMPLATES: ChartTemplate[] = [
  defaultTemplate,
  natureTemplate,
  ieeeTemplate,
  acsTemplate,
  scienceTemplate,
  vibrantTemplate,
  mutedTemplate,
  highContrastTemplate,
]

export function getTemplateById(id: string): ChartTemplate | undefined {
  return TEMPLATES.find((t) => t.id === id)
}
