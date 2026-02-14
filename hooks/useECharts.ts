'use client'

import { useEffect, useRef, useCallback, type RefObject } from 'react'
import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import {
  TitleComponent,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  GraphicComponent,
  DataZoomComponent,
} from 'echarts/components'
import { SVGRenderer } from 'echarts/renderers'
import type { EChartsType, SetOptionOpts } from 'echarts/core'
import type { ECBasicOption } from 'echarts/types/dist/shared'

echarts.use([
  LineChart,
  TitleComponent,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  GraphicComponent,
  DataZoomComponent,
  SVGRenderer,
])

export type EChartsOption = ECBasicOption

export function useECharts(
  containerRef: RefObject<HTMLDivElement | null>,
  option: EChartsOption
) {
  const instanceRef = useRef<EChartsType | null>(null)

  // Init chart instance
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const instance = echarts.init(container, null, { renderer: 'svg' })
    instanceRef.current = instance

    return () => {
      instance.dispose()
      instanceRef.current = null
    }
  }, [containerRef])

  // Update option when it changes
  useEffect(() => {
    const instance = instanceRef.current
    if (!instance) return
    instance.setOption(option, { notMerge: false } as SetOptionOpts)
  }, [option])

  // Resize handler
  useEffect(() => {
    const instance = instanceRef.current
    if (!instance) return

    const handleResize = () => {
      instance.resize()
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const setOption = useCallback(
    (opt: EChartsOption, opts?: SetOptionOpts) => {
      instanceRef.current?.setOption(opt, opts ?? {})
    },
    []
  )

  return { chartRef: instanceRef, setOption }
}
