'use client'

import { useEffect, useMemo } from 'react'
import { useTranslation } from '@/lib/i18n'
import { useGalleryStore, getFilteredItems } from '@/stores/galleryStore'
import { GalleryFilter } from '@/components/gallery/GalleryFilter'
import { GalleryGrid } from '@/components/gallery/GalleryGrid'
import { GalleryDetail } from '@/components/gallery/GalleryDetail'
import { AIConfigPanel } from '@/components/gallery/AIConfigPanel'

export default function GalleryPage() {
  const { t } = useTranslation()
  const store = useGalleryStore()
  const { actions, selectedItem } = store

  useEffect(() => {
    actions.loadFavorites()
  }, [actions])

  const filteredItems = useMemo(() => getFilteredItems(store), [store])

  return (
    <main className="mx-auto h-[calc(100vh-3rem)] max-w-7xl overflow-y-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t('gallery.title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('gallery.subtitle')}
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="flex-1">
          <GalleryFilter />
        </div>
        <AIConfigPanel />
      </div>

      <div className="mb-4 text-sm text-muted-foreground">
        {filteredItems.length} {t('gallery.items')}
      </div>

      {filteredItems.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-muted-foreground">
          {t('gallery.noResults')}
        </div>
      ) : (
        <GalleryGrid items={filteredItems} />
      )}

      {selectedItem && (
        <GalleryDetail
          item={selectedItem}
          onClose={() => actions.setSelectedItem(null)}
        />
      )}
    </main>
  )
}
