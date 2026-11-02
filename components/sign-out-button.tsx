'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'
import { useI18n } from '@/components/i18n-provider'

export function SignOutButton({ showLabel = false, className }: { showLabel?: boolean; className?: string }) {
  const router = useRouter()
  const { t } = useI18n()
  const [pending, startTransition] = useTransition()

  return (
    <Button
      variant="ghost"
      size={showLabel ? 'default' : 'icon'}
      aria-label={t('nav.signOut')}
      title={t('nav.signOut')}
      disabled={pending}
      className={className}
      onClick={() =>
        startTransition(async () => {
          await authClient.signOut()
          router.push('/')
          router.refresh()
        })
      }
    >
      <LogOut className="rtl:-scale-x-100" aria-hidden="true" />
      {showLabel && t('nav.signOut')}
    </Button>
  )
}
