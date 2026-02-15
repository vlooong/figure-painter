'use client'

import { useState } from 'react'
import { useTranslation } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import type { BenchmarkSetting } from '@/lib/types'

interface CopyMenuProps {
  metricNames: string[]
  setting: BenchmarkSetting
  lowerIsBetter: boolean[]
}

function formatLaTeX(
  metricNames: string[],
  setting: BenchmarkSetting,
  lowerIsBetter: boolean[]
): string {
  const bestPerMetric = metricNames.map((_, mi) => {
    const values = setting.results
      .map((r) => r.values[mi])
      .filter((v): v is number => v !== null)
    if (values.length === 0) return null
    return lowerIsBetter[mi] ? Math.min(...values) : Math.max(...values)
  })

  const colSpec = 'l' + metricNames.map(() => 'r').join('')
  const header = ['Algorithm', ...metricNames].join(' & ')
  const rows = setting.results.map((r) => {
    const cells = [
      r.algorithm,
      ...r.values.map((v, mi) => {
        if (v === null) return '-'
        const s = v.toFixed(3)
        return v === bestPerMetric[mi] ? `\\textbf{${s}}` : s
      }),
    ]
    return cells.join(' & ') + ' \\\\'
  })

  return [
    `\\begin{tabular}{${colSpec}}`,
    '\\toprule',
    header + ' \\\\',
    '\\midrule',
    ...rows,
    '\\bottomrule',
    '\\end{tabular}',
  ].join('\n')
}

function formatTSV(
  metricNames: string[],
  setting: BenchmarkSetting
): string {
  const header = ['Algorithm', ...metricNames].join('\t')
  const rows = setting.results.map((r) => {
    const cells = [
      r.algorithm,
      ...r.values.map((v) => (v !== null ? v.toFixed(3) : '')),
    ]
    return cells.join('\t')
  })
  return [header, ...rows].join('\n')
}

function formatMarkdown(
  metricNames: string[],
  setting: BenchmarkSetting,
  lowerIsBetter: boolean[]
): string {
  const bestPerMetric = metricNames.map((_, mi) => {
    const values = setting.results
      .map((r) => r.values[mi])
      .filter((v): v is number => v !== null)
    if (values.length === 0) return null
    return lowerIsBetter[mi] ? Math.min(...values) : Math.max(...values)
  })

  const header = '| Algorithm | ' + metricNames.join(' | ') + ' |'
  const sep =
    '| --- | ' + metricNames.map(() => '---:').join(' | ') + ' |'
  const rows = setting.results.map((r) => {
    const cells = r.values.map((v, mi) => {
      if (v === null) return '-'
      const s = v.toFixed(3)
      return v === bestPerMetric[mi] ? `**${s}**` : s
    })
    return '| ' + r.algorithm + ' | ' + cells.join(' | ') + ' |'
  })
  return [header, sep, ...rows].join('\n')
}

export function CopyMenu({ metricNames, setting, lowerIsBetter }: CopyMenuProps) {
  const { t } = useTranslation()
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null)

  const handleCopy = async (format: 'latex' | 'tsv' | 'markdown') => {
    let text: string
    switch (format) {
      case 'latex':
        text = formatLaTeX(metricNames, setting, lowerIsBetter)
        break
      case 'tsv':
        text = formatTSV(metricNames, setting)
        break
      case 'markdown':
        text = formatMarkdown(metricNames, setting, lowerIsBetter)
        break
    }
    await navigator.clipboard.writeText(text)
    setCopiedFormat(format)
    setTimeout(() => setCopiedFormat(null), 2000)
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">
        {t('benchmark.copyAs')}:
      </span>
      {(['latex', 'tsv', 'markdown'] as const).map((fmt) => {
        const label =
          fmt === 'latex'
            ? t('benchmark.copyLaTeX')
            : fmt === 'tsv'
              ? t('benchmark.copyTSV')
              : t('benchmark.copyMarkdown')
        return (
          <Button
            key={fmt}
            variant="outline"
            size="xs"
            onClick={() => handleCopy(fmt)}
          >
            {copiedFormat === fmt ? t('benchmark.copied') : label}
          </Button>
        )
      })}
    </div>
  )
}
