import { useCallback } from 'react'
import { db } from '@/services/db'
import type { ImageRecord, Dataset } from '@/lib/types'

export function useDexie() {
  const saveImage = useCallback(async (image: ImageRecord) => {
    await db.images.put(image)
  }, [])

  const loadImages = useCallback(async (): Promise<ImageRecord[]> => {
    return db.images.orderBy('createdAt').reverse().toArray()
  }, [])

  const deleteImage = useCallback(async (id: string) => {
    await db.images.delete(id)
  }, [])

  const saveDataset = useCallback(async (dataset: Dataset) => {
    await db.datasets.put(dataset)
  }, [])

  const loadDatasets = useCallback(async (): Promise<Dataset[]> => {
    return db.datasets.orderBy('createdAt').reverse().toArray()
  }, [])

  const deleteDataset = useCallback(async (id: string) => {
    await db.datasets.delete(id)
  }, [])

  return {
    saveImage,
    loadImages,
    deleteImage,
    saveDataset,
    loadDatasets,
    deleteDataset,
  }
}
