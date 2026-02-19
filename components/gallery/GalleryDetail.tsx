'use client'

import { useState } from 'react'
import { useTranslation } from '@/lib/i18n'
import { useGalleryStore } from '@/stores/galleryStore'
import { galleryImageUrl } from '@/lib/galleryData'
import type { GalleryItem } from '@/lib/gallery-types'
import { Button } from '@/components/ui/button'

interface GalleryDetailProps {
  item: GalleryItem
  onClose: () => void
}

export function GalleryDetail({ item, onClose }: GalleryDetailProps) {
  const { t, locale } = useTranslation()
  const favorites = useGalleryStore((s) => s.favorites)
  const { toggleFavorite } = useGalleryStore((s) => s.actions)
  const isFav = favorites.has(item.id)
  const [imgError, setImgError] = useState(false)

  const title = locale === 'zh' ? item.titleZh : item.title
  const description = locale === 'zh' ? item.descriptionZh : item.description
  const src = galleryImageUrl(item.imagePath)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border bg-background p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-accent"
          >
            <svg viewBox="0 0 20 20" className="h-5 w-5" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Image */}
        <div className="mb-4 overflow-hidden rounded-md border bg-muted">
          {!imgError && src ? (
            <img
              src={src}
              alt={title}
              className="w-full object-contain"
              style={{ maxHeight: '400px' }}
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex aspect-[16/10] items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="flex gap-2">
                  {item.colorPalette.map((color, i) => (
                    <div
                      key={i}
                      className="h-12 w-12 rounded-md shadow-sm"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">{title}</span>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="mb-4 text-sm text-muted-foreground">{description}</p>

        {/* Meta info */}
        <div className="mb-4 space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium">{t('gallery.detail.source')}:</span>
            <span className="text-muted-foreground">
              {item.source.name}
              {item.source.url && (
                <>
                  {' '}
                  <a
                    href={item.source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    [link]
                  </a>
                </>
              )}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{t('gallery.detail.chartType')}:</span>
            <div className="flex gap-1">
              {item.chartTypes.map((ct) => (
                <span key={ct} className="rounded bg-accent px-1.5 py-0.5 text-xs">
                  {t(`gallery.chartTypes.${ct}` as keyof typeof t)}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{t('gallery.detail.journalStyle')}:</span>
            <div className="flex gap-1">
              {item.journalStyles.map((s) => (
                <span key={s} className="rounded bg-accent px-1.5 py-0.5 text-xs">
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{t('gallery.detail.colorTone')}:</span>
            <div className="flex gap-1">
              {item.colorTones.map((ct) => (
                <span key={ct} className="rounded bg-accent px-1.5 py-0.5 text-xs">
                  {t(`gallery.colorTones.${ct}` as keyof typeof t)}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Color Palette */}
        <div className="mb-4">
          <span className="text-sm font-medium">
            {t('gallery.detail.colorPalette')}
          </span>
          <div className="mt-2 flex gap-2">
            {item.colorPalette.map((color, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className="h-10 w-10 rounded-md border shadow-sm"
                  style={{ backgroundColor: color }}
                />
                <span className="text-[10px] font-mono text-muted-foreground">
                  {color}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant={isFav ? 'default' : 'outline'}
            size="sm"
            onClick={() => toggleFavorite(item.id)}
          >
            {isFav ? t('gallery.unfavorite') : t('gallery.favorite')}
          </Button>
          <Button variant="outline" size="sm" disabled title={t('gallery.generateComingSoon')}>
            {t('gallery.generateWithStyle')}
          </Button>
        </div>
      </div>
    </div>
  )
}
