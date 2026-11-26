'use client'

import { useState } from 'react'
import { Megaphone, X } from 'lucide-react'
import { useI18n } from '@/components/i18n-provider'

export const ANNOUNCEMENT_COOKIE = 'ann_dismissed'

/** Notice bar at the very top of the site. Closing it hides it for this visitor until a new notice is published. */
export function AnnouncementBanner({ id, text }: { id: string; text: string }) {
  const { t } = useI18n()
  const [hidden, setHidden] = useState(false)
  if (hidden) return null

  return (
    <div role="status" className="relative z-50 border-b border-primary/30 bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-7xl items-start gap-3 px-4 py-2.5 md:px-6">
        <Megaphone className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <p className="min-w-0 flex-1 text-sm leading-relaxed whitespace-pre-line [overflow-wrap:anywhere]">{text}</p>
        <button
          type="button"
          aria-label={t('an.close')}
          className="-m-1 shrink-0 rounded p-1 hover:bg-primary-foreground/15"
          onClick={() => {
            document.cookie = `${ANNOUNCEMENT_COOKIE}=${encodeURIComponent(id)}; path=/; max-age=86400; samesite=lax`
            setHidden(true)
          }}
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
