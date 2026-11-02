'use client'

import { useTransition } from 'react'
import { Languages } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/components/i18n-provider'
import { setLocale } from '@/app/actions/locale'

export function LocaleSwitch() {
  const { locale, t } = useI18n()
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const next = locale === 'ar' ? 'en' : 'ar'

  return (
    <Button
      variant="ghost"
      aria-label={t('nav.langAria')}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await setLocale(next)
          router.refresh()
        })
      }
    >
      <Languages aria-hidden="true" />
      <span>{t('nav.langName')}</span>
    </Button>
  )
}
