'use client'

import { useTranslation } from '@/lib/i18n'
import { Input } from '@/components/ui/input'

interface DatasetSearchProps {
  value: string
  onChange: (value: string) => void
}

export function DatasetSearch({ value, onChange }: DatasetSearchProps) {
  const { t } = useTranslation()

  return (
    <Input
      type="text"
      placeholder={t('benchmark.search')}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="max-w-sm"
    />
  )
}
