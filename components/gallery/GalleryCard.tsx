'use client'

import { useState } from 'react'
import { useTranslation } from '@/lib/i18n'
import { useGalleryStore } from '@/stores/galleryStore'
import { galleryImageUrl } from '@/lib/galleryData'
import type { GalleryItem } from '@/lib/gallery-types'
import { cn } from '@/lib/utils'

export function GalleryCard({ item }: { item: GalleryItem }) {
  const { t, locale } = useTranslation()
  const favorites = useGalleryStore((s) => s.favorites)
  const { setSelectedItem, toggleFavorite } = useGalleryStore((s) => s.actions)
  const isFav = favorites.has(item.id)
  const [imgError, setImgError] = useState(false)

  const title = locale === 'zh' ? item.titleZh : item.title
  const src = galleryImageUrl(item.thumbnailPath)

  return (
    <div
      className="group cursor-pointer overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-md"
      onClick={() => setSelectedItem(item)}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {!imgError && src ? (
          <img
            src={src}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          /* Fallback: color palette preview */
          <div className="flex h-full items-center justify-center p-4">
            <div className="flex flex-col items-center gap-2">
              <div className="flex gap-1">
                {item.colorPalette.slice(0, 5).map((color, i) => (
                  <div
                    key={i}
                    className="h-8 w-8 rounded"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                {item.chartTypes[0]}
              </span>
            </div>
          </div>
        )}
        {/* Favorite button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            toggleFavorite(item.id)
          }}
          className={cn(
            'absolute right-2 top-2 rounded-full p-1.5 transition-colors',
            isFav
              ? 'bg-primary/90 text-primary-foreground'
              : 'bg-background/80 text-muted-foreground opacity-0 group-hover:opacity-100'
          )}
          title={isFav ? t('gallery.unfavorite') : t('gallery.favorite')}
        >
          <svg
            viewBox="0 0 20 20"
            className="h-4 w-4"
            fill={isFav ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      </div>
      {/* Info */}
      <div className="p-3">
        <h3 className="line-clamp-1 text-sm font-medium">{title}</h3>
        <div className="mt-1 flex flex-wrap gap-1">
          {item.journalStyles.map((s) => (
            <span
              key={s}
              className="rounded bg-accent px-1.5 py-0.5 text-[10px] text-accent-foreground"
            >
              {s}
            </span>
          ))}
        </div>
        {/* Mini palette */}
        <div className="mt-2 flex gap-0.5">
          {item.colorPalette.slice(0, 6).map((color, i) => (
            <div
              key={i}
              className="h-3 flex-1 first:rounded-l last:rounded-r"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
