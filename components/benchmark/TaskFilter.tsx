'use client'

import { cn } from '@/lib/utils'
import { useTranslation } from '@/lib/i18n'
import { TASK_CATEGORIES } from '@/lib/benchmarkData'

interface TaskFilterProps {
  selectedTask: string | null
  onSelect: (taskId: string | null) => void
}

export function TaskFilter({ selectedTask, onSelect }: TaskFilterProps) {
  const { t, locale } = useTranslation()

  return (
    <div className="flex flex-wrap gap-1.5">
      <button
        onClick={() => onSelect(null)}
        className={cn(
          'rounded-full px-3 py-1 text-sm font-medium transition-colors',
          selectedTask === null
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        )}
      >
        {t('benchmark.allTasks')}
      </button>
      {TASK_CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={cn(
            'rounded-full px-3 py-1 text-sm font-medium transition-colors',
            selectedTask === cat.id
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          )}
        >
          {locale === 'zh' ? cat.nameZh : cat.name}
        </button>
      ))}
    </div>
  )
}
