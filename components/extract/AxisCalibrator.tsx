'use client'

import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useExtractStore } from '@/stores/extractStore'
import { useTranslation } from '@/lib/i18n'
import type { AxisConfig, Calibration, CalibrationPoint } from '@/lib/types'

export interface AxisCalibratorHandle {
  addPixelPoint: (pixel: { x: number; y: number }) => void
}

export const AxisCalibrator = forwardRef<AxisCalibratorHandle>(
  function AxisCalibrator(_props, ref) {
    const { t } = useTranslation()
    const tool = useExtractStore((s) => s.tool)
    const calibration = useExtractStore((s) => s.calibration)
    const { setCalibration, setTool, setPendingCalibrationPoints, clearPendingCalibrationPoints } = useExtractStore((s) => s.actions)

    const [points, setPoints] = useState<CalibrationPoint[]>([])
    const [xAxisType, setXAxisType] = useState<'linear' | 'log'>('linear')
    const [yAxisType, setYAxisType] = useState<'linear' | 'log'>('linear')

    const isCalibrating = tool === 'calibrate'

    useEffect(() => {
      if (!isCalibrating) {
        clearPendingCalibrationPoints()
        return
      }
      setPendingCalibrationPoints(points)
    }, [
      isCalibrating,
      points,
      setPendingCalibrationPoints,
      clearPendingCalibrationPoints,
    ])

    const addPixelPoint = useCallback(
      (pixel: { x: number; y: number }) => {
        if (!isCalibrating) return
        if (points.length >= 4) return

        const newPoint: CalibrationPoint = {
          pixel,
          data: { x: 0, y: 0 },
        }
        setPoints((prev) => [...prev, newPoint])
      },
      [isCalibrating, points.length]
    )

    useImperativeHandle(ref, () => ({ addPixelPoint }), [addPixelPoint])

    const updateDataValue = useCallback(
      (index: number, axis: 'x' | 'y', value: string) => {
        setPoints((prev) =>
          prev.map((p, i) =>
            i === index
              ? { ...p, data: { ...p.data, [axis]: parseFloat(value) || 0 } }
              : p
          )
        )
      },
      []
    )

    const removePoint = useCallback((index: number) => {
      setPoints((prev) => prev.filter((_, i) => i !== index))
    }, [])

    const confirmCalibration = useCallback(() => {
      if (points.length < 2) return

      const dataXs = points.map((p) => p.data.x)
      const dataYs = points.map((p) => p.data.y)

      const xAxis: AxisConfig = {
        type: xAxisType,
        min: Math.min(...dataXs),
        max: Math.max(...dataXs),
      }
      const yAxis: AxisConfig = {
        type: yAxisType,
        min: Math.min(...dataYs),
        max: Math.max(...dataYs),
      }

      const cal: Calibration = { points, xAxis, yAxis }
      setCalibration(cal)
      setTool('select')
    }, [points, xAxisType, yAxisType, setCalibration, setTool])

    const startCalibration = useCallback(() => {
      setTool('calibrate')
      setPoints([])
      setCalibration(null)
    }, [setTool, setCalibration])

    const clearCalibration = useCallback(() => {
      setPoints([])
      setCalibration(null)
      setTool('select')
    }, [setCalibration, setTool])

    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">{t('extract.calibration.title')}</h3>
          {calibration && (
            <span className="text-xs font-medium text-green-600">
              {t('extract.calibration.calibrated')}
            </span>
          )}
        </div>

        {!isCalibrating && !calibration && (
          <Button size="sm" onClick={startCalibration}>
            {t('extract.calibration.startCalibration')}
          </Button>
        )}

        {isCalibrating && (
          <p className="text-xs text-muted-foreground">
            {t('extract.calibration.instruction', { count: points.length })}
          </p>
        )}

        {/* Axis type selection */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              {t('extract.calibration.xAxis')}
            </label>
            <select
              className="mt-1 w-full rounded-md border bg-background px-2 py-1 text-sm"
              value={xAxisType}
              onChange={(e) =>
                setXAxisType(e.target.value as 'linear' | 'log')
              }
            >
              <option value="linear">{t('extract.calibration.linear')}</option>
              <option value="log">{t('extract.calibration.log')}</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              {t('extract.calibration.yAxis')}
            </label>
            <select
              className="mt-1 w-full rounded-md border bg-background px-2 py-1 text-sm"
              value={yAxisType}
              onChange={(e) =>
                setYAxisType(e.target.value as 'linear' | 'log')
              }
            >
              <option value="linear">{t('extract.calibration.linear')}</option>
              <option value="log">{t('extract.calibration.log')}</option>
            </select>
          </div>
        </div>

        {/* Point list */}
        {points.length > 0 && (
          <div className="flex flex-col gap-2">
            {points.map((pt, i) => (
              <div key={i} className="rounded-md border p-2">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-medium">
                    P{i + 1}{' '}
                    <span className="text-muted-foreground">
                      (px: {pt.pixel.x.toFixed(0)}, {pt.pixel.y.toFixed(0)})
                    </span>
                  </span>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => removePoint(i)}
                  >
                    {t('extract.calibration.remove')}
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground">
                      {t('extract.calibration.dataX')}
                    </label>
                    <Input
                      type="number"
                      step="any"
                      className="h-7 text-sm"
                      value={pt.data.x ?? ''}
                      onChange={(e) =>
                        updateDataValue(i, 'x', e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">
                      {t('extract.calibration.dataY')}
                    </label>
                    <Input
                      type="number"
                      step="any"
                      className="h-7 text-sm"
                      value={pt.data.y ?? ''}
                      onChange={(e) =>
                        updateDataValue(i, 'y', e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action buttons */}
        {isCalibrating && points.length >= 2 && (
          <Button size="sm" onClick={confirmCalibration}>
            {t('extract.calibration.confirmCalibration')}
          </Button>
        )}

        {(isCalibrating || calibration) && (
          <Button variant="outline" size="sm" onClick={clearCalibration}>
            {t('extract.calibration.clearCalibration')}
          </Button>
        )}

        {/* Calibration summary */}
        {calibration && (
          <div className="rounded-md border bg-muted/50 p-2 text-xs">
            <p>
              X: [{calibration.xAxis.min}, {calibration.xAxis.max}] (
              {calibration.xAxis.type})
            </p>
            <p>
              Y: [{calibration.yAxis.min}, {calibration.yAxis.max}] (
              {calibration.yAxis.type})
            </p>
            <p>{t('extract.calibration.pointsSummary', { count: calibration.points.length })}</p>
          </div>
        )}
      </div>
    )
  }
)
