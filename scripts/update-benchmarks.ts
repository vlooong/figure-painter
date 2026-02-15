/**
 * Automated Benchmark Data Update Script
 *
 * Fetches READMEs from time-series algorithm GitHub repos,
 * parses Markdown tables for benchmark results, merges with
 * existing data, and writes updated JSON + diff summary.
 *
 * Usage: npx tsx scripts/update-benchmarks.ts
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

// ---- Types ----

interface Source {
  algorithm: string
  repo: string
  branch: string
  year: number
  paper: string
  arxiv: string
}

interface ParsedResult {
  algorithm: string
  dataset: string
  setting: string
  metric: string
  value: number
}

interface BenchmarkData {
  algorithmPapers: Record<string, string>
  taskCategories: Array<{ id: string; name: string; nameZh: string }>
  datasets: Array<{ id: string; name: string; [key: string]: unknown }>
  tables: Array<{
    datasetId: string
    taskId: string
    metricNames: string[]
    lowerIsBetter: boolean[]
    settingLabel: string
    settingLabelZh: string
    settings: Array<{
      name: string
      results: Array<{
        algorithm: string
        values: (number | null)[]
        paper?: string
        year?: number
      }>
    }>
  }>
}

// ---- Configuration ----

const SOURCES: Source[] = [
  {
    algorithm: 'iTransformer',
    repo: 'thuml/iTransformer',
    branch: 'main',
    year: 2024,
    paper: 'iTransformer: Inverted Transformers Are Effective for Time Series Forecasting',
    arxiv: 'https://arxiv.org/abs/2310.06625',
  },
  {
    algorithm: 'PatchTST',
    repo: 'yuqinie98/PatchTST',
    branch: 'main',
    year: 2023,
    paper: 'A Time Series is Worth 64 Words',
    arxiv: 'https://arxiv.org/abs/2211.14730',
  },
  {
    algorithm: 'TimesNet',
    repo: 'thuml/Time-Series-Library',
    branch: 'main',
    year: 2023,
    paper: 'TimesNet: Temporal 2D-Variation Modeling for General Time Series Analysis',
    arxiv: 'https://arxiv.org/abs/2210.02186',
  },
  {
    algorithm: 'DLinear',
    repo: 'cure-lab/LTSF-Linear',
    branch: 'main',
    year: 2023,
    paper: 'Are Transformers Effective for Time Series Forecasting?',
    arxiv: 'https://arxiv.org/abs/2205.13504',
  },
  {
    algorithm: 'Crossformer',
    repo: 'Thinklab-SJTU/Crossformer',
    branch: 'main',
    year: 2023,
    paper: 'Crossformer: Transformer Utilizing Cross-Dimension Dependency for Multivariate Time Series Forecasting',
    arxiv: 'https://arxiv.org/abs/2209.05249',
  },
  {
    algorithm: 'FEDformer',
    repo: 'MAZiqing/FEDformer',
    branch: 'main',
    year: 2022,
    paper: 'FEDformer: Frequency Enhanced Decomposed Transformer',
    arxiv: 'https://arxiv.org/abs/2201.12740',
  },
  {
    algorithm: 'Autoformer',
    repo: 'thuml/Autoformer',
    branch: 'main',
    year: 2021,
    paper: 'Autoformer: Decomposition Transformers with Auto-Correlation',
    arxiv: 'https://arxiv.org/abs/2106.13008',
  },
]

// Dataset name normalization: maps README table headers → our dataset IDs
const DATASET_ALIASES: Record<string, string> = {
  'etth1': 'etth1',
  'etth2': 'etth2',
  'ettm1': 'ettm1',
  'ettm2': 'ettm2',
  'weather': 'weather',
  'electricity': 'ecl',
  'ecl': 'ecl',
  'traffic': 'traffic',
  'smd': 'smd',
  'msl': 'msl',
  'smap': 'smap',
  'swat': 'swat',
  'psm': 'psm',
}

// Standard prediction lengths for long-term forecasting
const STANDARD_SETTINGS = ['96', '192', '336', '720']

// ---- README Fetching ----

async function fetchReadme(source: Source): Promise<string | null> {
  const branches = [source.branch, 'master']
  for (const branch of branches) {
    const url = `https://raw.githubusercontent.com/${source.repo}/${branch}/README.md`
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(15000) })
      if (res.ok) {
        console.log(`  Fetched ${source.repo} (${branch})`)
        return await res.text()
      }
    } catch {
      // Try next branch
    }
  }
  console.warn(`  WARN: Could not fetch README for ${source.repo}`)
  return null
}

// ---- Markdown Table Parsing ----

interface MarkdownTable {
  headers: string[]
  rows: string[][]
}

function extractMarkdownTables(markdown: string): MarkdownTable[] {
  const tables: MarkdownTable[] = []
  const lines = markdown.split('\n')

  let i = 0
  while (i < lines.length) {
    const line = lines[i].trim()

    // Look for table start: a line with pipes
    if (line.startsWith('|') && line.endsWith('|')) {
      // Check if next line is a separator
      const nextLine = (lines[i + 1] || '').trim()
      if (nextLine.match(/^\|[\s\-:|]+\|$/)) {
        // Parse header
        const headers = line
          .split('|')
          .map((s) => s.trim())
          .filter(Boolean)

        // Skip separator
        i += 2

        // Parse rows
        const rows: string[][] = []
        while (i < lines.length) {
          const rowLine = lines[i].trim()
          if (!rowLine.startsWith('|') || !rowLine.endsWith('|')) break
          // Skip separator rows in the middle
          if (rowLine.match(/^\|[\s\-:|]+\|$/)) {
            i++
            continue
          }
          const cells = rowLine
            .split('|')
            .map((s) => s.trim())
            .filter(Boolean)
          rows.push(cells)
          i++
        }

        if (rows.length > 0) {
          tables.push({ headers, rows })
        }
        continue
      }
    }
    i++
  }

  return tables
}

/**
 * Parse a "wide format" table where columns are like:
 * | Model | ETTh1 MSE | ETTh1 MAE | ETTh2 MSE | ...
 *
 * Or a table grouped by prediction length:
 * | Model | Metric | 96 | 192 | 336 | 720 |
 */
function parseWideFormatTable(
  table: MarkdownTable,
  sourceAlgorithm: string
): ParsedResult[] {
  const results: ParsedResult[] = []
  const { headers, rows } = table

  // Pattern 1: Headers contain dataset+metric combos
  // e.g., "ETTh1 MSE", "ETTh1 MAE", "Weather MSE"
  const datasetMetricCols: Array<{
    colIdx: number
    dataset: string
    metric: string
  }> = []

  for (let col = 1; col < headers.length; col++) {
    const header = headers[col]
    // Try to match "DatasetName MetricName" pattern
    const match = header.match(/^(\S+)\s+(MSE|MAE|RMSE|MAPE|F1|Precision|Recall)$/i)
    if (match) {
      const datasetRaw = match[1].toLowerCase()
      const datasetId = DATASET_ALIASES[datasetRaw]
      if (datasetId) {
        datasetMetricCols.push({
          colIdx: col,
          dataset: datasetId,
          metric: match[2].toUpperCase(),
        })
      }
    }
  }

  if (datasetMetricCols.length > 0) {
    for (const row of rows) {
      const model = row[0]?.replace(/\*+/g, '').trim()
      if (!model) continue

      for (const { colIdx, dataset, metric } of datasetMetricCols) {
        const cellValue = row[colIdx]?.replace(/\*+/g, '').trim()
        const value = parseFloat(cellValue)
        if (!isNaN(value)) {
          results.push({
            algorithm: model,
            dataset,
            setting: '', // needs context from section header
            metric,
            value,
          })
        }
      }
    }
    return results
  }

  // Pattern 2: Headers are prediction lengths
  // | Models | Metric | 96 | 192 | 336 | 720 |
  const settingCols: Array<{ colIdx: number; setting: string }> = []
  for (let col = 1; col < headers.length; col++) {
    if (STANDARD_SETTINGS.includes(headers[col].trim())) {
      settingCols.push({ colIdx: col, setting: headers[col].trim() })
    }
  }

  if (settingCols.length > 0) {
    for (const row of rows) {
      const model = row[0]?.replace(/\*+/g, '').trim()
      if (!model) continue

      for (const { colIdx, setting } of settingCols) {
        const cellValue = row[colIdx]?.replace(/\*+/g, '').trim()
        const value = parseFloat(cellValue)
        if (!isNaN(value)) {
          results.push({
            algorithm: model,
            dataset: '', // needs context from section header
            setting,
            metric: '', // needs context from row
            value,
          })
        }
      }
    }
    return results
  }

  return results
}

/**
 * Parse results tables found in a section context.
 * Tries to identify the dataset and prediction lengths from
 * surrounding Markdown headings and table structure.
 */
function parseReadmeResults(
  markdown: string,
  source: Source
): ParsedResult[] {
  const allResults: ParsedResult[] = []
  const tables = extractMarkdownTables(markdown)

  if (tables.length === 0) return allResults

  // Split markdown into sections by headings to get context
  const sections = markdown.split(/^(#{1,4}\s+.+)$/m)

  for (const table of tables) {
    const parsed = parseWideFormatTable(table, source.algorithm)

    // Try to fill in missing dataset/setting info from context
    if (parsed.length > 0 && parsed.some((r) => !r.dataset || !r.setting)) {
      // Find section heading context for this table
      const tableText = table.headers.join('|')
      for (let s = 0; s < sections.length; s++) {
        if (sections[s].includes(tableText)) {
          // Look back for heading context
          for (let h = s - 1; h >= 0; h--) {
            const heading = sections[h].toLowerCase()
            // Try to find dataset name in heading
            for (const [alias, id] of Object.entries(DATASET_ALIASES)) {
              if (heading.includes(alias)) {
                for (const r of parsed) {
                  if (!r.dataset) r.dataset = id
                }
                break
              }
            }
            // Try to find prediction length in heading
            const lengthMatch = heading.match(
              /prediction\s+length\s*[=:]\s*(\d+)/i
            )
            if (lengthMatch) {
              for (const r of parsed) {
                if (!r.setting) r.setting = lengthMatch[1]
              }
            }
            if (parsed.every((r) => r.dataset && r.setting)) break
          }
          break
        }
      }
    }

    // Only keep results that have all required fields
    allResults.push(
      ...parsed.filter(
        (r) => r.dataset && r.metric && !isNaN(r.value)
      )
    )
  }

  return allResults
}

// ---- Merge Logic ----

interface MergeStats {
  added: number
  skippedExisting: number
  skippedUnknownDataset: number
  details: string[]
}

function mergeResults(
  data: BenchmarkData,
  results: ParsedResult[],
  source: Source
): MergeStats {
  const stats: MergeStats = {
    added: 0,
    skippedExisting: 0,
    skippedUnknownDataset: 0,
    details: [],
  }

  const knownDatasetIds = new Set(data.datasets.map((d) => d.id))

  for (const result of results) {
    // Skip if dataset not in our catalog
    if (!knownDatasetIds.has(result.dataset)) {
      stats.skippedUnknownDataset++
      continue
    }

    // Find matching table
    const table = data.tables.find(
      (t) =>
        t.datasetId === result.dataset &&
        t.metricNames.some(
          (m) => m.toUpperCase() === result.metric.toUpperCase()
        )
    )
    if (!table) continue

    const metricIdx = table.metricNames.findIndex(
      (m) => m.toUpperCase() === result.metric.toUpperCase()
    )
    if (metricIdx === -1) continue

    // Find or skip setting
    let setting = table.settings.find((s) => s.name === result.setting)
    if (!setting && result.setting) {
      // Setting doesn't exist, skip (requires manual dataset metadata entry)
      continue
    }
    if (!setting) {
      // Use "Default" for anomaly detection
      setting = table.settings.find((s) => s.name === 'Default')
    }
    if (!setting) continue

    // Check if algorithm already exists in this setting
    const existing = setting.results.find(
      (r) => r.algorithm === source.algorithm
    )
    if (existing) {
      // Keep existing values — human must review conflicts
      stats.skippedExisting++
      continue
    }

    // New algorithm on existing dataset+setting → append
    const newValues: (number | null)[] = new Array(
      table.metricNames.length
    ).fill(null)
    newValues[metricIdx] = result.value

    // Check if we already started building values for this algorithm in this setting
    // (from a different metric column in the same pass)
    const pendingEntry = setting.results.find(
      (r) =>
        r.algorithm === source.algorithm &&
        r.year === source.year
    )
    if (pendingEntry) {
      if (pendingEntry.values[metricIdx] === null) {
        pendingEntry.values[metricIdx] = result.value
      }
      continue
    }

    setting.results.push({
      algorithm: source.algorithm,
      values: newValues,
      paper: source.paper,
      year: source.year,
    })
    stats.added++
    stats.details.push(
      `+ ${source.algorithm} → ${result.dataset}/${setting.name} (${result.metric}=${result.value})`
    )
  }

  return stats
}

// ---- Main ----

async function main() {
  const scriptDir = dirname(fileURLToPath(import.meta.url))
  const projectRoot = resolve(scriptDir, '..')
  const dataPath = resolve(projectRoot, 'lib', 'benchmark-data.json')
  const diffPath = resolve(scriptDir, 'update-diff.md')

  console.log('Loading existing benchmark data...')
  const data: BenchmarkData = JSON.parse(readFileSync(dataPath, 'utf-8'))

  const allStats: Array<{ source: Source; stats: MergeStats }> = []

  console.log(`\nFetching READMEs from ${SOURCES.length} repos...\n`)

  for (const source of SOURCES) {
    console.log(`[${source.algorithm}] ${source.repo}`)
    const readme = await fetchReadme(source)
    if (!readme) {
      allStats.push({
        source,
        stats: { added: 0, skippedExisting: 0, skippedUnknownDataset: 0, details: ['SKIP: Could not fetch README'] },
      })
      continue
    }

    const parsed = parseReadmeResults(readme, source)
    console.log(`  Parsed ${parsed.length} result entries`)

    const stats = mergeResults(data, parsed, source)
    allStats.push({ source, stats })

    if (stats.added > 0) {
      console.log(`  Added ${stats.added} new entries`)
    }
    if (stats.skippedExisting > 0) {
      console.log(`  Skipped ${stats.skippedExisting} (already exist)`)
    }
  }

  // Write updated data
  console.log('\nWriting updated benchmark-data.json...')
  writeFileSync(dataPath, JSON.stringify(data, null, 2) + '\n', 'utf-8')

  // Generate diff summary
  const totalAdded = allStats.reduce((s, a) => s + a.stats.added, 0)
  const totalSkipped = allStats.reduce(
    (s, a) => s + a.stats.skippedExisting,
    0
  )

  const diffLines = [
    '# Benchmark Data Update Summary',
    '',
    `**Date**: ${new Date().toISOString().split('T')[0]}`,
    `**Total new entries**: ${totalAdded}`,
    `**Skipped (existing)**: ${totalSkipped}`,
    '',
    '## Per-Source Details',
    '',
  ]

  for (const { source, stats } of allStats) {
    diffLines.push(`### ${source.algorithm} (${source.repo})`)
    diffLines.push('')
    diffLines.push(`- Added: ${stats.added}`)
    diffLines.push(`- Skipped (existing): ${stats.skippedExisting}`)
    diffLines.push(
      `- Skipped (unknown dataset): ${stats.skippedUnknownDataset}`
    )
    if (stats.details.length > 0) {
      diffLines.push('')
      for (const detail of stats.details) {
        diffLines.push(`  ${detail}`)
      }
    }
    diffLines.push('')
  }

  if (totalAdded === 0) {
    diffLines.push('---')
    diffLines.push('')
    diffLines.push('*No new data was found. All existing entries are up to date.*')
  }

  mkdirSync(dirname(diffPath), { recursive: true })
  writeFileSync(diffPath, diffLines.join('\n') + '\n', 'utf-8')
  console.log(`\nDiff summary written to ${diffPath}`)

  if (totalAdded > 0) {
    console.log(`\n✓ ${totalAdded} new entries added. Review the changes and commit.`)
  } else {
    console.log('\n✓ No new data found. Everything is up to date.')
  }
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
