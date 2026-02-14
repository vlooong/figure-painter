'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { usePlotStore } from '@/stores/plotStore'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { useTranslation } from '@/lib/i18n'
import type { AxisConfig, PlotConfig } from '@/lib/types'

const DEBOUNCE_MS = 300

export function ChartConfigurator() {
  const { t } = useTranslation()
  const activePlot = usePlotStore((s) => s.activePlot)
  const { updatePlotConfig } = usePlotStore((s) => s.actions)

  // Local form state (debounced before pushing to store)
  const [title, setTitle] = useState('')
  const [xLabel, setXLabel] = useState('')
  const [xUnit, setXUnit] = useState('')
  const [xMin, setXMin] = useState('')
  const [xMax, setXMax] = useState('')
  const [yLabel, setYLabel] = useState('')
  const [yUnit, setYUnit] = useState('')
  const [yMin, setYMin] = useState('')
  const [yMax, setYMax] = useState('')
  const [dualY, setDualY] = useState(false)
  const [y2Label, setY2Label] = useState('')
  const [y2Unit, setY2Unit] = useState('')
  const [y2Min, setY2Min] = useState('')
  const [y2Max, setY2Max] = useState('')

  // Sync from store to local state when activePlot changes externally
  const syncedIdRef = useRef<string | null>(null)
  useEffect(() => {
    if (!activePlot) return
    if (syncedIdRef.current === activePlot.id) return
    syncedIdRef.current = activePlot.id
    setTitle(activePlot.title || '')
    setXLabel(activePlot.xAxis.label || '')
    setXUnit(activePlot.xAxis.unit || '')
    setXMin(activePlot.xAxis.min === -Infinity ? '' : String(activePlot.xAxis.min))
    setXMax(activePlot.xAxis.max === Infinity ? '' : String(activePlot.xAxis.max))
    setYLabel(activePlot.yAxis.label || '')
    setYUnit(activePlot.yAxis.unit || '')
    setYMin(activePlot.yAxis.min === -Infinity ? '' : String(activePlot.yAxis.min))
    setYMax(activePlot.yAxis.max === Infinity ? '' : String(activePlot.yAxis.max))
    setDualY(!!activePlot.yAxis2)
    if (activePlot.yAxis2) {
      setY2Label(activePlot.yAxis2.label || '')
      setY2Unit(activePlot.yAxis2.unit || '')
      setY2Min(activePlot.yAxis2.min === -Infinity ? '' : String(activePlot.yAxis2.min))
      setY2Max(activePlot.yAxis2.max === Infinity ? '' : String(activePlot.yAxis2.max))
    }
  }, [activePlot])

  // Debounced push to store
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const pushToStore = useCallback(() => {
    if (!activePlot) return

    const parseNum = (val: string, fallback: number): number => {
      const n = Number(val)
      return val === '' || Number.isNaN(n) ? fallback : n
    }

    const xAxis: AxisConfig = {
      type: activePlot.xAxis.type,
      label: xLabel || undefined,
      unit: xUnit || undefined,
      min: parseNum(xMin, -Infinity),
      max: parseNum(xMax, Infinity),
    }

    const yAxis: AxisConfig = {
      type: activePlot.yAxis.type,
      label: yLabel || undefined,
      unit: yUnit || undefined,
      min: parseNum(yMin, -Infinity),
      max: parseNum(yMax, Infinity),
    }

    const updates: Partial<PlotConfig> = {
      title,
      xAxis,
      yAxis,
    }

    if (dualY) {
      updates.yAxis2 = {
        type: 'linear',
        label: y2Label || undefined,
        unit: y2Unit || undefined,
        min: parseNum(y2Min, -Infinity),
        max: parseNum(y2Max, Infinity),
      }
    } else {
      updates.yAxis2 = undefined
    }

    updatePlotConfig(updates)
  }, [
    activePlot,
    title,
    xLabel,
    xUnit,
    xMin,
    xMax,
    yLabel,
    yUnit,
    yMin,
    yMax,
    dualY,
    y2Label,
    y2Unit,
    y2Min,
    y2Max,
    updatePlotConfig,
  ])

  // Schedule debounced update whenever local form changes
  useEffect(() => {
    if (!activePlot) return
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(pushToStore, DEBOUNCE_MS)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [
    pushToStore,
    activePlot,
    title,
    xLabel,
    xUnit,
    xMin,
    xMax,
    yLabel,
    yUnit,
    yMin,
    yMax,
    dualY,
    y2Label,
    y2Unit,
    y2Min,
    y2Max,
  ])

  if (!activePlot) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        {t('plot.noActiveConfig')}
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto">
      <h2 className="text-sm font-semibold">{t('plot.chartSettings.title')}</h2>

      {/* Title */}
      <FieldGroup label={t('plot.chartSettings.chartTitle')}>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t('plot.chartSettings.chartTitlePlaceholder')}
        />
      </FieldGroup>

      {/* X Axis */}
      <fieldset className="flex flex-col gap-2 rounded-md border p-3">
        <legend className="px-1 text-xs font-medium text-muted-foreground">
          {t('plot.chartSettings.xAxis')}
        </legend>
        <FieldGroup label={t('plot.chartSettings.label')}>
          <Input
            value={xLabel}
            onChange={(e) => setXLabel(e.target.value)}
            placeholder={t('plot.chartSettings.placeholderTime')}
          />
        </FieldGroup>
        <FieldGroup label={t('plot.chartSettings.unit')}>
          <Input
            value={xUnit}
            onChange={(e) => setXUnit(e.target.value)}
            placeholder={t('plot.chartSettings.placeholderS')}
          />
        </FieldGroup>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label={t('plot.chartSettings.min')}>
            <Input
              type="number"
              value={xMin}
              onChange={(e) => setXMin(e.target.value)}
              placeholder={t('plot.chartSettings.auto')}
            />
          </FieldGroup>
          <FieldGroup label={t('plot.chartSettings.max')}>
            <Input
              type="number"
              value={xMax}
              onChange={(e) => setXMax(e.target.value)}
              placeholder={t('plot.chartSettings.auto')}
            />
          </FieldGroup>
        </div>
      </fieldset>

      {/* Y Axis */}
      <fieldset className="flex flex-col gap-2 rounded-md border p-3">
        <legend className="px-1 text-xs font-medium text-muted-foreground">
          {t('plot.chartSettings.yAxis')}
        </legend>
        <FieldGroup label={t('plot.chartSettings.label')}>
          <Input
            value={yLabel}
            onChange={(e) => setYLabel(e.target.value)}
            placeholder={t('plot.chartSettings.placeholderVoltage')}
          />
        </FieldGroup>
        <FieldGroup label={t('plot.chartSettings.unit')}>
          <Input
            value={yUnit}
            onChange={(e) => setYUnit(e.target.value)}
            placeholder={t('plot.chartSettings.placeholderV')}
          />
        </FieldGroup>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label={t('plot.chartSettings.min')}>
            <Input
              type="number"
              value={yMin}
              onChange={(e) => setYMin(e.target.value)}
              placeholder={t('plot.chartSettings.auto')}
            />
          </FieldGroup>
          <FieldGroup label={t('plot.chartSettings.max')}>
            <Input
              type="number"
              value={yMax}
              onChange={(e) => setYMax(e.target.value)}
              placeholder={t('plot.chartSettings.auto')}
            />
          </FieldGroup>
        </div>
      </fieldset>

      {/* Dual Y-Axis toggle */}
      <div className="flex items-center gap-2">
        <Checkbox
          checked={dualY}
          onCheckedChange={(checked) => setDualY(checked === true)}
        />
        <span className="text-sm">{t('plot.chartSettings.dualYAxis')}</span>
      </div>

      {/* Y2 Axis (conditional) */}
      {dualY && (
        <fieldset className="flex flex-col gap-2 rounded-md border p-3">
          <legend className="px-1 text-xs font-medium text-muted-foreground">
            {t('plot.chartSettings.y2Axis')}
          </legend>
          <FieldGroup label={t('plot.chartSettings.label')}>
            <Input
              value={y2Label}
              onChange={(e) => setY2Label(e.target.value)}
              placeholder={t('plot.chartSettings.placeholderCurrent')}
            />
          </FieldGroup>
          <FieldGroup label={t('plot.chartSettings.unit')}>
            <Input
              value={y2Unit}
              onChange={(e) => setY2Unit(e.target.value)}
              placeholder={t('plot.chartSettings.placeholderA')}
            />
          </FieldGroup>
          <div className="grid grid-cols-2 gap-2">
            <FieldGroup label={t('plot.chartSettings.min')}>
              <Input
                type="number"
                value={y2Min}
                onChange={(e) => setY2Min(e.target.value)}
                placeholder={t('plot.chartSettings.auto')}
              />
            </FieldGroup>
            <FieldGroup label={t('plot.chartSettings.max')}>
              <Input
                type="number"
                value={y2Max}
                onChange={(e) => setY2Max(e.target.value)}
                placeholder={t('plot.chartSettings.auto')}
              />
            </FieldGroup>
          </div>
        </fieldset>
      )}
    </div>
  )
}

function FieldGroup({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-muted-foreground">{label}</label>
      {children}
    </div>
  )
}
