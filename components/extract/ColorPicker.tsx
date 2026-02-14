'use client'

import { useCallback } from 'react'
import { Slider } from '@/components/ui/slider'
import { useExtractStore } from '@/stores/extractStore'

export function ColorPicker() {
  const selectedColor = useExtractStore((s) => s.selectedColor)
  const tolerance = useExtractStore((s) => s.tolerance)
  const tool = useExtractStore((s) => s.tool)
  const { setTolerance } = useExtractStore((s) => s.actions)

  const handleToleranceChange = useCallback(
    (value: number[]) => {
      setTolerance(value[0])
    },
    [setTolerance]
  )

  const isPickMode = tool === 'pick'

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold">Color Picker</h3>

      {!isPickMode && !selectedColor && (
        <p className="text-xs text-muted-foreground">
          Select the &quot;Color Pick&quot; tool above, then click on the image
          to sample a color.
        </p>
      )}

      {isPickMode && !selectedColor && (
        <p className="text-xs text-muted-foreground">
          Click on the image to sample a pixel color.
        </p>
      )}

      {selectedColor && (
        <div className="flex flex-col gap-3">
          {/* Color swatch and hex code */}
          <div className="flex items-center gap-3">
            <div
              className="size-10 shrink-0 rounded-md border shadow-sm"
              style={{ backgroundColor: selectedColor }}
            />
            <div>
              <p className="text-sm font-mono font-medium">
                {selectedColor.toUpperCase()}
              </p>
              <p className="text-xs text-muted-foreground">Selected color</p>
            </div>
          </div>

          {/* Tolerance slider */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">
                Tolerance
              </label>
              <span className="text-xs font-mono tabular-nums">
                {tolerance}
              </span>
            </div>
            <Slider
              min={0}
              max={255}
              step={1}
              value={[tolerance]}
              onValueChange={handleToleranceChange}
            />
            <p className="text-xs text-muted-foreground">
              Lower = stricter color matching. Higher = more permissive.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
