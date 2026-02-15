'use client'

import { useCallback } from 'react'
import { usePlotStore } from '@/stores/plotStore'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { useTranslation } from '@/lib/i18n'
import type { AdvancedConfig } from '@/lib/types'

export function AdvancedConfigPanel() {
  const { t } = useTranslation()
  const activePlot = usePlotStore((s) => s.activePlot)
  const { updateAdvancedConfig } = usePlotStore((s) => s.actions)

  const adv: AdvancedConfig = activePlot?.advancedConfig ?? {}

  const update = useCallback(
    (partial: Partial<AdvancedConfig>) => {
      updateAdvancedConfig(partial)
    },
    [updateAdvancedConfig]
  )

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold">{t('plot.advancedConfig.title')}</h2>

      {/* Section 1: Data Points */}
      <details className="group rounded-md border">
        <summary className="cursor-pointer select-none px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent/50">
          {t('plot.advancedConfig.dataPoints')}
        </summary>
        <div className="flex flex-col gap-3 px-3 pb-3 pt-1">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={adv.showSymbol ?? true}
              onCheckedChange={(checked) =>
                update({ showSymbol: checked === true })
              }
            />
            <span className="text-xs text-muted-foreground">
              {t('plot.advancedConfig.showSymbol')}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">
              {t('plot.advancedConfig.symbolSize', { n: adv.symbolSize ?? 8 })}
            </label>
            <Slider
              min={2}
              max={20}
              step={1}
              value={[adv.symbolSize ?? 8]}
              onValueChange={(v) => update({ symbolSize: v[0] })}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">
              {t('plot.advancedConfig.symbolShape')}
            </label>
            <select
              className="h-8 rounded-md border bg-background px-2 text-xs"
              value={adv.symbolShape ?? 'circle'}
              onChange={(e) =>
                update({
                  symbolShape: e.target.value as AdvancedConfig['symbolShape'],
                })
              }
            >
              <option value="circle">{t('plot.advancedConfig.shapeCircle')}</option>
              <option value="rect">{t('plot.advancedConfig.shapeRect')}</option>
              <option value="triangle">{t('plot.advancedConfig.shapeTriangle')}</option>
              <option value="diamond">{t('plot.advancedConfig.shapeDiamond')}</option>
              <option value="none">{t('plot.advancedConfig.shapeNone')}</option>
            </select>
          </div>
        </div>
      </details>

      {/* Section 2: Legend */}
      <details className="group rounded-md border">
        <summary className="cursor-pointer select-none px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent/50">
          {t('plot.advancedConfig.legend')}
        </summary>
        <div className="flex flex-col gap-3 px-3 pb-3 pt-1">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={adv.legendVisible ?? true}
              onCheckedChange={(checked) =>
                update({ legendVisible: checked === true })
              }
            />
            <span className="text-xs text-muted-foreground">
              {t('plot.advancedConfig.legendVisible')}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">
              {t('plot.advancedConfig.legendPosition')}
            </label>
            <select
              className="h-8 rounded-md border bg-background px-2 text-xs"
              value={adv.legendPosition ?? 'bottom'}
              onChange={(e) =>
                update({
                  legendPosition: e.target.value as AdvancedConfig['legendPosition'],
                })
              }
            >
              <option value="top">{t('plot.advancedConfig.posTop')}</option>
              <option value="bottom">{t('plot.advancedConfig.posBottom')}</option>
              <option value="left">{t('plot.advancedConfig.posLeft')}</option>
              <option value="right">{t('plot.advancedConfig.posRight')}</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">
              {t('plot.advancedConfig.legendOrientation')}
            </label>
            <select
              className="h-8 rounded-md border bg-background px-2 text-xs"
              value={adv.legendOrientation ?? 'horizontal'}
              onChange={(e) =>
                update({
                  legendOrientation: e.target.value as AdvancedConfig['legendOrientation'],
                })
              }
            >
              <option value="horizontal">{t('plot.advancedConfig.orientHorizontal')}</option>
              <option value="vertical">{t('plot.advancedConfig.orientVertical')}</option>
            </select>
          </div>
        </div>
      </details>

      {/* Section 3: Grid Lines */}
      <details className="group rounded-md border">
        <summary className="cursor-pointer select-none px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent/50">
          {t('plot.advancedConfig.gridLines')}
        </summary>
        <div className="flex flex-col gap-3 px-3 pb-3 pt-1">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={adv.showGridLines ?? true}
              onCheckedChange={(checked) =>
                update({ showGridLines: checked === true })
              }
            />
            <span className="text-xs text-muted-foreground">
              {t('plot.advancedConfig.showGridLines')}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">
              {t('plot.advancedConfig.gridLineStyle')}
            </label>
            <select
              className="h-8 rounded-md border bg-background px-2 text-xs"
              value={adv.gridLineStyle ?? 'dashed'}
              onChange={(e) =>
                update({
                  gridLineStyle: e.target.value as AdvancedConfig['gridLineStyle'],
                })
              }
            >
              <option value="solid">{t('plot.advancedConfig.styleSolid')}</option>
              <option value="dashed">{t('plot.advancedConfig.styleDashed')}</option>
              <option value="dotted">{t('plot.advancedConfig.styleDotted')}</option>
            </select>
          </div>
        </div>
      </details>

      {/* Section 4: Line Style */}
      <details className="group rounded-md border">
        <summary className="cursor-pointer select-none px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent/50">
          {t('plot.advancedConfig.lineStyle')}
        </summary>
        <div className="flex flex-col gap-3 px-3 pb-3 pt-1">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">
              {t('plot.advancedConfig.lineWidth', { n: (adv.lineWidth ?? 1.5).toFixed(1) })}
            </label>
            <Slider
              min={1}
              max={10}
              step={1}
              value={[Math.round((adv.lineWidth ?? 1.5) * 2)]}
              onValueChange={(v) => update({ lineWidth: v[0] / 2 })}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">
              {t('plot.advancedConfig.lineType')}
            </label>
            <select
              className="h-8 rounded-md border bg-background px-2 text-xs"
              value={adv.lineType ?? 'solid'}
              onChange={(e) =>
                update({
                  lineType: e.target.value as AdvancedConfig['lineType'],
                })
              }
            >
              <option value="solid">{t('plot.advancedConfig.styleSolid')}</option>
              <option value="dashed">{t('plot.advancedConfig.styleDashed')}</option>
              <option value="dotted">{t('plot.advancedConfig.styleDotted')}</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              checked={adv.smooth ?? false}
              onCheckedChange={(checked) =>
                update({ smooth: checked === true })
              }
            />
            <span className="text-xs text-muted-foreground">
              {t('plot.advancedConfig.smooth')}
            </span>
          </div>
        </div>
      </details>

      {/* Section 5: Axis Labels */}
      <details className="group rounded-md border">
        <summary className="cursor-pointer select-none px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent/50">
          {t('plot.advancedConfig.axisLabels')}
        </summary>
        <div className="flex flex-col gap-3 px-3 pb-3 pt-1">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">
              {t('plot.advancedConfig.axisFontSize', { n: adv.axisFontSize ?? 12 })}
            </label>
            <Slider
              min={6}
              max={24}
              step={1}
              value={[adv.axisFontSize ?? 12]}
              onValueChange={(v) => update({ axisFontSize: v[0] })}
            />
          </div>
        </div>
      </details>
    </div>
  )
}
