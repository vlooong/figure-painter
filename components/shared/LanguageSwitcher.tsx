'use client'

import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n'

export function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLocale(locale === 'en' ? 'zh' : 'en')}
    >
      {locale === 'en' ? '\u4e2d\u6587' : 'EN'}
    </Button>
  )
}
