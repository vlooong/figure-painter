'use client'

import { useCallback } from 'react'
import { usePlotStore } from '@/stores/plotStore'
import { TEMPLATES } from '@/lib/templates'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import type { ChartTemplate } from '@/lib/types'

export function StyleTemplatePanel() {
  const activePlot = usePlotStore((s) => s.activePlot)
  const { applyTemplate, setCustomOverrides, resetToTemplate } = usePlotStore(
    (s) => s.actions
  )

  const activeTemplateId = activePlot?.templateId ?? ''
  const overrides = activePlot?.customOverrides ?? {}

  const handleApply = useCallback(
    (id: string) => {
      applyTemplate(id)
    },
    [applyTemplate]
  )

  const handleFontSizeChange = useCallback(
    (value: number[]) => {
      const scale = value[0]
      setCustomOverrides({
        fontSize: {
          title: scale,
          axis: Math.max(1, scale - 2),
          legend: Math.max(1, scale - 4),
          tick: Math.max(1, scale - 4),
        },
      })
    },
    [setCustomOverrides]
  )

  const handleLineWidthChange = useCallback(
    (value: number[]) => {
      setCustomOverrides({ lineWidth: value[0] / 10 })
    },
    [setCustomOverrides]
  )

  const handleColorChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const color = e.target.value
      // Replace first color in the palette
      const base = TEMPLATES.find((t) => t.id === activeTemplateId)
      if (base) {
        setCustomOverrides({
          colors: [color, ...base.colors.slice(1)],
        })
      }
    },
    [setCustomOverrides, activeTemplateId]
  )

  const handleGridToggle = useCallback(
    (checked: boolean | 'indeterminate') => {
      setCustomOverrides({
        axisStyle: {
          showGrid: checked === true,
          gridStyle: 'dashed',
          tickInside: false,
          boxFrame: false,
        },
      })
    },
    [setCustomOverrides]
  )

  // Resolve current values for sliders
  const currentFontSize = overrides.fontSize?.title ?? 0
  const currentLineWidth = overrides.lineWidth ?? 0

  // Determine effective grid state from overrides or template
  const baseTemplate = TEMPLATES.find((t) => t.id === activeTemplateId)
  const effectiveGridShow =
    overrides.axisStyle?.showGrid ?? baseTemplate?.axisStyle.showGrid ?? true

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold">Style Templates</h2>

      {/* Template cards grid */}
      <div className="grid grid-cols-2 gap-2">
        {TEMPLATES.map((tpl) => (
          <TemplateCard
            key={tpl.id}
            template={tpl}
            isActive={tpl.id === activeTemplateId}
            onSelect={handleApply}
          />
        ))}
      </div>

      {/* Customization section */}
      {activeTemplateId && (
        <fieldset className="flex flex-col gap-3 rounded-md border p-3">
          <legend className="px-1 text-xs font-medium text-muted-foreground">
            Custom Overrides
          </legend>

          {/* Font size slider */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">
              Title Font Size: {currentFontSize || baseTemplate?.fontSize.title || 14}pt
            </label>
            <Slider
              min={4}
              max={24}
              step={1}
              value={[currentFontSize || baseTemplate?.fontSize.title || 14]}
              onValueChange={handleFontSizeChange}
            />
          </div>

          {/* Line width slider */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">
              Line Width: {(currentLineWidth || baseTemplate?.lineWidth || 1.5).toFixed(1)}
            </label>
            <Slider
              min={3}
              max={30}
              step={1}
              value={[
                Math.round(
                  (currentLineWidth || baseTemplate?.lineWidth || 1.5) * 10
                ),
              ]}
              onValueChange={handleLineWidthChange}
            />
          </div>

          {/* Primary color input */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">
              Primary Color
            </label>
            <Input
              type="color"
              value={
                overrides.colors?.[0] ?? baseTemplate?.colors[0] ?? '#5470c6'
              }
              onChange={handleColorChange}
              className="h-8 w-full cursor-pointer p-1"
            />
          </div>

          {/* Grid visibility checkbox */}
          <div className="flex items-center gap-2">
            <Checkbox
              checked={effectiveGridShow}
              onCheckedChange={handleGridToggle}
            />
            <span className="text-xs text-muted-foreground">Show Grid</span>
          </div>

          {/* Reset button */}
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={resetToTemplate}
          >
            Reset to Template
          </Button>
        </fieldset>
      )}
    </div>
  )
}

// ---- Template Card ----

function TemplateCard({
  template,
  isActive,
  onSelect,
}: {
  template: ChartTemplate
  isActive: boolean
  onSelect: (id: string) => void
}) {
  return (
    <button
      type="button"
      className={`flex flex-col gap-1.5 rounded-md border p-2 text-left transition-colors hover:bg-accent/50 ${
        isActive ? 'border-primary bg-accent/30' : 'border-border'
      }`}
      onClick={() => onSelect(template.id)}
    >
      <span className="text-xs font-medium">{template.name}</span>
      <span className="text-[10px] leading-tight text-muted-foreground">
        {template.description}
      </span>
      {/* Color preview dots */}
      <div className="flex gap-1">
        {template.colors.slice(0, 6).map((color, i) => (
          <span
            key={i}
            className="inline-block size-3 rounded-full"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </button>
  )
}
