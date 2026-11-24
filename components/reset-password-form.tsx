'use client'

import { useEffect, useRef } from 'react'
import { adminResetPassword } from '@/app/actions/admin-users'
import { useFormAction } from '@/lib/use-form-action'
import { useI18n } from '@/components/i18n-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function ResetPasswordForm({ userId }: { userId: string }) {
  const { t } = useI18n()
  const { state, onSubmit, pending } = useFormAction(adminResetPassword)
  const ref = useRef<HTMLFormElement>(null)
  useEffect(() => {
    if (state?.success) ref.current?.reset()
  }, [state])

  return (
    <form ref={ref} onSubmit={onSubmit} className="flex flex-col gap-3">
      <input type="hidden" name="id" value={userId} />
      <div className="flex flex-col gap-1.5 sm:max-w-xs">
        <Label htmlFor={`pw-${userId}`}>{t('au.newPw')}</Label>
        <Input id={`pw-${userId}`} name="password" type="password" minLength={8} maxLength={128} required autoComplete="new-password" dir="ltr" className="text-start" />
      </div>
      {state?.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
      {state?.success && <p role="status" className="text-sm text-success">{state.success}</p>}
      <Button type="submit" variant="outline" disabled={pending} className="self-start">
        {t('au.setPw')}
      </Button>
    </form>
  )
}
