'use client'

import { useTranslation } from '@/lib/i18n'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { ALGORITHM_PAPERS } from '@/lib/benchmarkData'
import type { BenchmarkSetting } from '@/lib/types'

interface BenchmarkResultTableProps {
  metricNames: string[]
  lowerIsBetter: boolean[]
  setting: BenchmarkSetting
}

export function BenchmarkResultTable({
  metricNames,
  lowerIsBetter,
  setting,
}: BenchmarkResultTableProps) {
  const { t } = useTranslation()

  // Find best value per metric column
  const bestPerMetric = metricNames.map((_, mi) => {
    const values = setting.results
      .map((r) => r.values[mi])
      .filter((v): v is number => v !== null)
    if (values.length === 0) return null
    return lowerIsBetter[mi] ? Math.min(...values) : Math.max(...values)
  })

  // Sort rows by primary metric
  const sorted = [...setting.results].sort((a, b) => {
    const va = a.values[0]
    const vb = b.values[0]
    if (va === null && vb === null) return 0
    if (va === null) return 1
    if (vb === null) return -1
    return lowerIsBetter[0] ? va - vb : vb - va
  })

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('benchmark.algorithm')}</TableHead>
          {metricNames.map((name) => (
            <TableHead key={name} className="text-right">
              {name}
            </TableHead>
          ))}
          <TableHead className="text-right">{t('benchmark.paper')}</TableHead>
          <TableHead className="text-right">{t('benchmark.year')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((result) => {
          const paperUrl = ALGORITHM_PAPERS[result.algorithm]
          return (
            <TableRow key={result.algorithm}>
              <TableCell className="font-medium">{result.algorithm}</TableCell>
              {result.values.map((val, mi) => {
                const isBest = val !== null && val === bestPerMetric[mi]
                return (
                  <TableCell
                    key={mi}
                    className={`text-right tabular-nums ${
                      isBest ? 'font-bold text-primary' : ''
                    }`}
                  >
                    {val !== null ? val.toFixed(3) : '-'}
                  </TableCell>
                )
              })}
              <TableCell className="text-right">
                {paperUrl ? (
                  <a
                    href={paperUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                    title={result.paper}
                  >
                    arXiv
                  </a>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {result.year ?? '-'}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

