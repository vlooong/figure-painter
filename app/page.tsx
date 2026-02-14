'use client'

import { useTranslation } from '@/lib/i18n'

export default function Home() {
  const { t } = useTranslation()

  return (
    <main className="flex min-h-[calc(100vh-3rem)] flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">{t('home.title')}</h1>
      <p className="text-lg text-gray-600 mb-8">{t('home.subtitle')}</p>
      <div className="flex gap-4">
        <a href="/extract" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          {t('home.extractLink')}
        </a>
        <a href="/plot" className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">
          {t('home.plotLink')}
        </a>
      </div>
    </main>
  )
}
