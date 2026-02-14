'use client'

import { useRef, useMemo, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react'
import type { EChartsType } from 'echarts/core'
import { useECharts, type EChartsOption } from '@/hooks/useECharts'
import { usePlotStore, getEffectiveTemplate } from '@/stores/plotStore'
import { useDatasetStore } from '@/stores/datasetStore'

export interface ChartCanvasHandle {
  getChartInstance: () => EChartsType | null
}

export const ChartCanvas = forwardRef<ChartCanvasHandle>(function ChartCanvas(_props, ref) {
  const containerRef = useRef<HTMLDivElement>(null)

  const activePlot = usePlotStore((s) => s.activePlot)
  const { updatePlotConfig } = usePlotStore((s) => s.actions)
  const datasets = useDatasetStore((s) => s.datasets)

  // Gather selected datasets
  const selectedDatasets = useMemo(() => {
    if (!activePlot) return []
    return activePlot.datasetIds
      .map((id) => datasets.get(id))
      .filter((d): d is NonNullable<typeof d> => d != null)
  }, [activePlot, datasets])

  // Build ECharts option from plot config + datasets
  const option: EChartsOption = useMemo(() => {
    if (!activePlot) {
      return {
        title: { text: 'No active plot', left: 'center', top: 'middle' },
      }
    }

    const template = getEffectiveTemplate(activePlot)

    const series = selectedDatasets.map((ds, idx) => ({
      type: 'line' as const,
      name: ds.name,
      data: ds.points.map((p) => [p.x, p.y]),
      lineStyle: {
        color: ds.color,
        width: template?.lineWidth ?? 1.5,
      },
      itemStyle: { color: ds.color },
      symbolSize: 8,
      symbol: 'circle' as const,
    }))

    // Shared axis style derived from template
    const splitLineConfig = template
      ? {
          show: template.axisStyle.showGrid,
          lineStyle: {
            type: template.axisStyle.gridStyle as 'solid' | 'dashed' | 'dotted',
          },
        }
      : { show: true, lineStyle: { type: 'dashed' as const } }

    const axisTickConfig = template
      ? { inside: template.axisStyle.tickInside }
      : { inside: false }

    // Box frame: show axis lines on all 4 sides when boxFrame is true
    const axisLineConfig = { show: true }

    const yAxisList: Record<string, unknown>[] = [
      {
        type: 'value',
        name: activePlot.yAxis.label
          ? `${activePlot.yAxis.label}${activePlot.yAxis.unit ? ` (${activePlot.yAxis.unit})` : ''}`
          : undefined,
        min: activePlot.yAxis.min !== -Infinity ? activePlot.yAxis.min : undefined,
        max: activePlot.yAxis.max !== Infinity ? activePlot.yAxis.max : undefined,
        nameTextStyle: { fontSize: template?.fontSize.axis },
        axisLabel: { fontSize: template?.fontSize.tick },
        splitLine: splitLineConfig,
        axisTick: axisTickConfig,
        axisLine: axisLineConfig,
      },
    ]

    if (activePlot.yAxis2) {
      yAxisList.push({
        type: 'value',
        name: activePlot.yAxis2.label
          ? `${activePlot.yAxis2.label}${activePlot.yAxis2.unit ? ` (${activePlot.yAxis2.unit})` : ''}`
          : undefined,
        min:
          activePlot.yAxis2.min !== -Infinity
            ? activePlot.yAxis2.min
            : undefined,
        max:
          activePlot.yAxis2.max !== Infinity
            ? activePlot.yAxis2.max
            : undefined,
        nameTextStyle: { fontSize: template?.fontSize.axis },
        axisLabel: { fontSize: template?.fontSize.tick },
        splitLine: splitLineConfig,
        axisTick: axisTickConfig,
        axisLine: axisLineConfig,
      })
    }

    // Build draggable graphic elements
    const graphicElements: Record<string, unknown>[] = []
    for (const ds of selectedDatasets) {
      for (let i = 0; i < ds.points.length; i++) {
        const p = ds.points[i]
        graphicElements.push({
          type: 'circle',
          position: [0, 0], // Will be set by convertToPixel after render
          shape: { r: 6 },
          style: {
            fill: ds.color,
            opacity: 0.6,
            stroke: '#fff',
            lineWidth: 1,
          },
          draggable: true,
          // Store dataset info for drag handler lookup
          info: { datasetId: ds.id, pointIndex: i },
          z: 100,
          invisible: true, // Start invisible, position in callback
        })
      }
    }

    return {
      // Global text style from template
      textStyle: template
        ? { fontFamily: template.fontFamily }
        : undefined,
      // Color palette from template
      color: template?.colors,
      title: {
        text: activePlot.title || undefined,
        left: 'center',
        textStyle: template
          ? { fontSize: template.fontSize.title, fontFamily: template.fontFamily }
          : undefined,
      },
      tooltip: {
        trigger: 'item',
      },
      legend: {
        bottom: 0,
        textStyle: template
          ? { fontSize: template.fontSize.legend }
          : undefined,
      },
      grid: {
        left: 60,
        right: activePlot.yAxis2 ? 60 : 30,
        top: activePlot.title ? 50 : 30,
        bottom: 40,
        containLabel: false,
      },
      xAxis: {
        type: 'value',
        name: activePlot.xAxis.label
          ? `${activePlot.xAxis.label}${activePlot.xAxis.unit ? ` (${activePlot.xAxis.unit})` : ''}`
          : undefined,
        min:
          activePlot.xAxis.min !== -Infinity
            ? activePlot.xAxis.min
            : undefined,
        max:
          activePlot.xAxis.max !== Infinity
            ? activePlot.xAxis.max
            : undefined,
        nameTextStyle: template
          ? { fontSize: template.fontSize.axis }
          : undefined,
        axisLabel: template
          ? { fontSize: template.fontSize.tick }
          : undefined,
        splitLine: splitLineConfig,
        axisTick: axisTickConfig,
        axisLine: axisLineConfig,
      },
      yAxis: yAxisList,
      series,
      // graphic elements positioned after render via callback
      graphic: graphicElements.length > 0
        ? { elements: graphicElements }
        : undefined,
    }
  }, [activePlot, selectedDatasets])

  const { chartRef, setOption } = useECharts(containerRef, option)

  // Expose chart instance to parent via ref
  useImperativeHandle(ref, () => ({
    getChartInstance: () => chartRef.current,
  }), [chartRef])

  // After chart renders, position graphic elements and make them draggable
  const updateGraphicPositions = useCallback(() => {
    const instance = chartRef.current
    if (!instance || !activePlot) return

    const graphicElements: Record<string, unknown>[] = []

    for (const ds of selectedDatasets) {
      for (let i = 0; i < ds.points.length; i++) {
        const p = ds.points[i]
        let pixel: number[]
        try {
          pixel = instance.convertToPixel('grid', [p.x, p.y]) as number[]
        } catch {
          continue
        }

        const dsId = ds.id
        const pointIdx = i

        graphicElements.push({
          type: 'circle',
          position: pixel,
          shape: { r: 6 },
          style: {
            fill: ds.color,
            opacity: 0.6,
            stroke: '#fff',
            lineWidth: 1,
          },
          draggable: true,
          z: 100,
          invisible: false,
          ondrag: function (this: { position: number[] }) {
            const newPixel = this.position
            try {
              const dataCoord = instance.convertFromPixel(
                'grid',
                newPixel
              ) as number[]
              if (dataCoord) {
                // Update the dataset point in the store
                const store = useDatasetStore.getState()
                const dataset = store.datasets.get(dsId)
                if (dataset) {
                  const newPoints = [...dataset.points]
                  newPoints[pointIdx] = {
                    ...newPoints[pointIdx],
                    x: dataCoord[0],
                    y: dataCoord[1],
                  }
                  store.actions.updateDataset(dsId, { points: newPoints })
                }
              }
            } catch {
              // ignore conversion errors during drag
            }
          },
        })
      }
    }

    if (graphicElements.length > 0) {
      setOption({
        graphic: { elements: graphicElements },
      })
    }
  }, [chartRef, activePlot, selectedDatasets, setOption])

  // Position graphic elements after option update
  useEffect(() => {
    const instance = chartRef.current
    if (!instance) return

    // Wait for next frame to ensure chart has rendered
    const raf = requestAnimationFrame(() => {
      updateGraphicPositions()
    })
    return () => cancelAnimationFrame(raf)
  }, [chartRef, option, updateGraphicPositions])

  // Also update positions on resize
  useEffect(() => {
    const handleResize = () => {
      requestAnimationFrame(() => {
        updateGraphicPositions()
      })
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [updateGraphicPositions])

  // Handle no active plot with auto-creation
  useEffect(() => {
    if (!activePlot) {
      updatePlotConfig({})
    }
  }, [activePlot, updatePlotConfig])

  return (
    <div className="flex h-full w-full flex-col">
      <div ref={containerRef} className="h-full w-full min-h-0 flex-1" />
    </div>
  )
})
