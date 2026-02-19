'use client'

import { useTranslation } from '@/lib/i18n'
import { useGalleryStore } from '@/stores/galleryStore'
import { allChartTypes, allJournalStyles, allColorTones } from '@/lib/galleryData'
import type { ChartType, JournalStyle, ColorTone } from '@/lib/gallery-types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function ToggleChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-background text-muted-foreground hover:bg-accent'
      )}
    >
      {label}
    </button>
  )
}

export function GalleryFilter() {
  const { t } = useTranslation()
  const filters = useGalleryStore((s) => s.filters)
  const { setFilters, resetFilters } = useGalleryStore((s) => s.actions)

  const toggleChartType = (ct: ChartType) => {
    const next = filters.chartTypes.includes(ct)
      ? filters.chartTypes.filter((x) => x !== ct)
      : [...filters.chartTypes, ct]
    setFilters({ chartTypes: next })
  }

  const toggleJournalStyle = (js: JournalStyle) => {
    const next = filters.journalStyles.includes(js)
      ? filters.journalStyles.filter((x) => x !== js)
      : [...filters.journalStyles, js]
    setFilters({ journalStyles: next })
  }

  const toggleColorTone = (ct: ColorTone) => {
    const next = filters.colorTones.includes(ct)
      ? filters.colorTones.filter((x) => x !== ct)
      : [...filters.colorTones, ct]
    setFilters({ colorTones: next })
  }

  const hasFilters =
    filters.search ||
    filters.chartTypes.length > 0 ||
    filters.journalStyles.length > 0 ||
    filters.colorTones.length > 0

  return (
    <div className="space-y-3">
      <Input
        placeholder={t('gallery.search')}
        value={filters.search}
        onChange={(e) => setFilters({ search: e.target.value })}
        className="max-w-sm"
      />

      <div className="space-y-2">
        <div>
          <span className="mr-2 text-xs font-medium text-muted-foreground">
            {t('gallery.filters.chartType')}
          </span>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {allChartTypes.map((ct) => (
              <ToggleChip
                key={ct}
                label={t(`gallery.chartTypes.${ct}` as keyof typeof t)}
                active={filters.chartTypes.includes(ct)}
                onClick={() => toggleChartType(ct)}
              />
            ))}
          </div>
        </div>

        <div>
          <span className="mr-2 text-xs font-medium text-muted-foreground">
            {t('gallery.filters.journalStyle')}
          </span>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {allJournalStyles.map((js) => (
              <ToggleChip
                key={js}
                label={js}
                active={filters.journalStyles.includes(js)}
                onClick={() => toggleJournalStyle(js)}
              />
            ))}
          </div>
        </div>

        <div>
          <span className="mr-2 text-xs font-medium text-muted-foreground">
            {t('gallery.filters.colorTone')}
          </span>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {allColorTones.map((ct) => (
              <ToggleChip
                key={ct}
                label={t(`gallery.colorTones.${ct}` as keyof typeof t)}
                active={filters.colorTones.includes(ct)}
                onClick={() => toggleColorTone(ct)}
              />
            ))}
          </div>
        </div>
      </div>

      {hasFilters && (
        <Button variant="outline" size="sm" onClick={resetFilters}>
          {t('gallery.filters.reset')}
        </Button>
      )}
    </div>
  )
}
