'use client'

import { useCallback, useRef, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useExtractStore } from '@/stores/extractStore'
import { useTranslation } from '@/lib/i18n'

type SortDir = 'asc' | 'desc' | null

interface DataTableProps {
  onRowClick?: (index: number) => void
}

export function DataTable({ onRowClick }: DataTableProps) {
  const { t } = useTranslation()
  const editingPoints = useExtractStore((s) => s.editingPoints)
  const selectedPointIndex = useExtractStore((s) => s.selectedPointIndex)
  const { updatePoint, deletePoint, addPoint, sortPointsByX } =
    useExtractStore((s) => s.actions)

  const [editCell, setEditCell] = useState<{
    row: number
    col: 'x' | 'y'
  } | null>(null)
  const [editValue, setEditValue] = useState('')
  const [sortDir, setSortDir] = useState<SortDir>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const startEdit = useCallback(
    (row: number, col: 'x' | 'y') => {
      setEditCell({ row, col })
      setEditValue(String(editingPoints[row][col]))
      // Focus the input after React renders it
      setTimeout(() => inputRef.current?.select(), 0)
    },
    [editingPoints]
  )

  const commitEdit = useCallback(() => {
    if (!editCell) return
    const parsed = parseFloat(editValue)
    if (Number.isNaN(parsed)) {
      setEditCell(null)
      return
    }
    const point = editingPoints[editCell.row]
    if (!point) {
      setEditCell(null)
      return
    }
    const updated =
      editCell.col === 'x'
        ? { x: parsed, y: point.y }
        : { x: point.x, y: parsed }
    updatePoint(editCell.row, updated)
    setEditCell(null)
  }, [editCell, editValue, editingPoints, updatePoint])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        commitEdit()
      } else if (e.key === 'Escape') {
        setEditCell(null)
      }
    },
    [commitEdit]
  )

  const handleSortToggle = useCallback(() => {
    const next: SortDir = sortDir === 'asc' ? 'desc' : 'asc'
    setSortDir(next)
    sortPointsByX(next === 'asc')
  }, [sortDir, sortPointsByX])

  const handleAdd = useCallback(() => {
    addPoint({ x: 0, y: 0 })
  }, [addPoint])

  const sortLabel = sortDir === 'asc' ? ' ^' : sortDir === 'desc' ? ' v' : ''

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          {t('extract.dataTable.title', { count: editingPoints.length })}
        </h3>
        <Button variant="outline" size="xs" onClick={handleAdd}>
          {t('extract.dataTable.addPoint')}
        </Button>
      </div>

      <div className="max-h-[300px] overflow-y-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={handleSortToggle}
              >
                {t('extract.dataTable.columnX')}{sortLabel}
              </TableHead>
              <TableHead>{t('extract.dataTable.columnY')}</TableHead>
              <TableHead className="w-16" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {editingPoints.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-muted-foreground"
                >
                  {t('extract.dataTable.noData')}
                </TableCell>
              </TableRow>
            ) : (
              editingPoints.map((pt, i) => (
                <TableRow
                  key={i}
                  className={`cursor-pointer ${i === selectedPointIndex ? 'bg-accent' : ''}`}
                  onClick={() => onRowClick?.(i)}
                >
                  <TableCell className="text-muted-foreground">{i + 1}</TableCell>

                  {/* X cell */}
                  <TableCell onDoubleClick={() => startEdit(i, 'x')}>
                    {editCell?.row === i && editCell.col === 'x' ? (
                      <Input
                        ref={inputRef}
                        className="h-6 w-24 px-1 text-xs"
                        type="number"
                        step="any"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={commitEdit}
                        onKeyDown={handleKeyDown}
                      />
                    ) : (
                      <span className="cursor-text text-xs tabular-nums">
                        {pt.x.toPrecision(6)}
                      </span>
                    )}
                  </TableCell>

                  {/* Y cell */}
                  <TableCell onDoubleClick={() => startEdit(i, 'y')}>
                    {editCell?.row === i && editCell.col === 'y' ? (
                      <Input
                        ref={inputRef}
                        className="h-6 w-24 px-1 text-xs"
                        type="number"
                        step="any"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={commitEdit}
                        onKeyDown={handleKeyDown}
                      />
                    ) : (
                      <span className="cursor-text text-xs tabular-nums">
                        {pt.y.toPrecision(6)}
                      </span>
                    )}
                  </TableCell>

                  {/* Delete action */}
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="text-destructive hover:text-destructive"
                      onClick={() => deletePoint(i)}
                      aria-label={t('extract.dataTable.deletePoint', { n: i + 1 })}
                    >
                      x
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
