'use client'

import { useState } from 'react'
import { useTranslation } from '@/lib/i18n'
import { useGalleryStore } from '@/stores/galleryStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function AIConfigPanel() {
  const { t } = useTranslation()
  const aiConfig = useGalleryStore((s) => s.aiConfig)
  const { setAIConfig, clearAIConfig } = useGalleryStore((s) => s.actions)

  const [expanded, setExpanded] = useState(false)
  const [apiKey, setApiKey] = useState(aiConfig?.apiKey ?? '')
  const [baseUrl, setBaseUrl] = useState(aiConfig?.baseUrl ?? '')
  const [modelName, setModelName] = useState(aiConfig?.modelName ?? '')

  const handleSave = () => {
    setAIConfig({ apiKey, baseUrl, modelName })
  }

  const handleClear = () => {
    clearAIConfig()
    setApiKey('')
    setBaseUrl('')
    setModelName('')
  }

  return (
    <div className="w-full shrink-0 rounded-lg border bg-card p-3 lg:w-72">
      <button
        type="button"
        className="flex w-full items-center justify-between text-sm font-medium"
        onClick={() => setExpanded(!expanded)}
      >
        <span>{t('gallery.aiConfig.title')}</span>
        <svg
          viewBox="0 0 20 20"
          className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {expanded && (
        <div className="mt-3 space-y-3">
          <p className="text-xs text-muted-foreground">
            {t('gallery.aiConfig.description')}
          </p>

          <div className="space-y-2">
            <label className="text-xs font-medium">{t('gallery.aiConfig.apiKey')}</label>
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="text-xs"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium">{t('gallery.aiConfig.baseUrl')}</label>
            <Input
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.example.com/v1"
              className="text-xs"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium">{t('gallery.aiConfig.modelName')}</label>
            <Input
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              placeholder="dall-e-3"
              className="text-xs"
            />
          </div>

          <p className="text-[10px] text-muted-foreground">
            {t('gallery.aiConfig.securityNote')}
          </p>

          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} className="flex-1 text-xs">
              {t('gallery.aiConfig.save')}
            </Button>
            {aiConfig && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                className="text-xs"
              >
                {t('gallery.aiConfig.clear')}
              </Button>
            )}
          </div>
        </div>
      )}

      {!expanded && (
        <div className="mt-1 text-xs text-muted-foreground">
          {aiConfig
            ? `${aiConfig.modelName || 'Configured'}`
            : t('gallery.aiConfig.notConfigured')}
        </div>
      )}
    </div>
  )
}
