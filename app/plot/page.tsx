'use client'

import { Suspense, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { ChartCanvas, type ChartCanvasHandle } from '@/components/plot/ChartCanvas'
import { DatasetSelector } from '@/components/plot/DatasetSelector'
import { ChartConfigurator } from '@/components/plot/ChartConfigurator'
import { StyleTemplatePanel } from '@/components/plot/StyleTemplatePanel'
import { ExportPanel } from '@/components/plot/ExportPanel'
import { usePlotStore } from '@/stores/plotStore'
import { TEMPLATES } from '@/lib/templates'

function PlotPageContent() {
  const chartCanvasRef = useRef<ChartCanvasHandle>(null)
  const searchParams = useSearchParams()
  const activePlot = usePlotStore((s) => s.activePlot)
  const { createPlot, addTemplate, applyTemplate, addDatasetToPlot } = usePlotStore(
    (s) => s.actions
  )

  // Ensure there is an active plot on mount
  useEffect(() => {
    if (!activePlot) {
      createPlot()
    }
  }, [activePlot, createPlot])

  // Initialize templates in store on mount
  useEffect(() => {
    for (const tpl of TEMPLATES) {
      addTemplate(tpl)
    }
  }, [addTemplate])

  // Apply default template if no template is set
  useEffect(() => {
    if (activePlot && !activePlot.templateId) {
      applyTemplate('default')
    }
  }, [activePlot, applyTemplate])

  // Auto-add dataset from URL query param
  useEffect(() => {
    const datasetId = searchParams.get('dataset')
    if (datasetId && activePlot) {
      addDatasetToPlot(datasetId)
    }
  }, [searchParams, activePlot, addDatasetToPlot])

  return (
    <main className="flex h-[calc(100vh-3rem)] gap-0">
      {/* Left sidebar - Dataset Selector */}
      <aside className="w-[250px] shrink-0 border-r p-3">
        <DatasetSelector />
      </aside>

      {/* Center - Chart Canvas */}
      <section className="flex-1 min-w-0 p-2">
        <ChartCanvas ref={chartCanvasRef} />
      </section>

      {/* Right sidebar - Chart Configurator + Templates + Export */}
      <aside className="w-[300px] shrink-0 overflow-y-auto border-l p-3">
        <ChartConfigurator />
        <div className="mt-4 border-t pt-4">
          <StyleTemplatePanel />
        </div>
        <div className="mt-4 border-t pt-4">
          <ExportPanel chartCanvasRef={chartCanvasRef} />
        </div>
      </aside>
    </main>
  )
}

export default function PlotPage() {
  return (
    <Suspense>
      <PlotPageContent />
    </Suspense>
  )
}
