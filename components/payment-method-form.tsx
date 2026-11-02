'use client'

import { useEffect, useRef, useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import type { PaymentMethod } from '@/lib/db/schema'
import { deletePaymentMethod, savePaymentMethod } from '@/app/actions/payments'
import { useFormAction } from '@/lib/use-form-action'
import { useI18n } from '@/components/i18n-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

/** Used both to add a new method (no `method`) and to edit an existing one. */
export function PaymentMethodForm({ method }: { method?: PaymentMethod }) {
  const { t } = useI18n()
  const { state, onSubmit, pending } = useFormAction(savePaymentMethod)
  const [deleting, startDelete] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)
  const uid = method ? `pm-${method.id}` : 'pm-new'

  useEffect(() => {
    if (!method && state?.success) formRef.current?.reset()
  }, [method, state])

  const missingAccount = method && method.enabled && method.requiresReference && !method.accountDetails

  return (
    <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-4 rounded-xl border bg-card p-5">
      {method && <input type="hidden" name="id" value={method.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        {!method && (
          <div className="flex flex-col gap-2 sm:col-span-2 sm:max-w-xs">
            <Label htmlFor={`${uid}-code`}>{t('ap.code')}</Label>
            <Input id={`${uid}-code`} name="code" required maxLength={30} dir="ltr" placeholder="fawry" className="text-start" />
            <p className="text-xs text-muted-foreground">{t('ap.codeHint')}</p>
          </div>
        )}
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${uid}-en`}>{t('ap.nameEn')}</Label>
          <Input id={`${uid}-en`} name="nameEn" required maxLength={60} dir="ltr" defaultValue={method?.nameEn} className="text-start" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${uid}-ar`}>{t('ap.nameAr')}</Label>
          <Input id={`${uid}-ar`} name="nameAr" required maxLength={60} dir="rtl" defaultValue={method?.nameAr} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${uid}-ien`}>{t('ap.instrEn')}</Label>
          <Textarea id={`${uid}-ien`} name="instructionsEn" rows={3} maxLength={600} dir="ltr" defaultValue={method?.instructionsEn} className="text-start" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${uid}-iar`}>{t('ap.instrAr')}</Label>
          <Textarea id={`${uid}-iar`} name="instructionsAr" rows={3} maxLength={600} dir="rtl" defaultValue={method?.instructionsAr} />
        </div>
        <div className="flex flex-col gap-2 sm:col-span-2 sm:max-w-md">
          <Label htmlFor={`${uid}-acc`}>{t('ap.account')}</Label>
          <Input id={`${uid}-acc`} name="accountDetails" maxLength={200} dir="ltr" defaultValue={method?.accountDetails} className="text-start font-mono" />
          <p className="text-xs text-muted-foreground">{t('ap.accountHint')}</p>
          {missingAccount && (
            <p role="alert" className="text-xs text-warning">
              {t('ap.warnNoAccount')}
            </p>
          )}
        </div>
        {method && (
          <div className="flex flex-col gap-2">
            <Label htmlFor={`${uid}-sort`}>{t('ap.sort')}</Label>
            <Input id={`${uid}-sort`} name="sortOrder" type="number" min={0} max={1000} defaultValue={method.sortOrder} className="w-24" />
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="requiresReference" defaultChecked={method?.requiresReference ?? false} className="size-4 accent-[var(--primary)]" />
          {t('ap.requiresRef')}
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="enabled" defaultChecked={method?.enabled ?? true} className="size-4 accent-[var(--primary)]" />
          {t('ap.enabled')}
        </label>
      </div>

      {state?.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p role="status" className="text-sm text-success">
          {state.success}
        </p>
      )}

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? t('ap.saving') : method ? t('ap.save') : t('ap.create')}
        </Button>
        {method && (
          <Button
            type="button"
            variant="ghost"
            disabled={deleting}
            className="text-muted-foreground hover:text-destructive"
            onClick={() => {
              if (confirm(t('ap.deleteConfirm'))) startDelete(() => deletePaymentMethod(method.id))
            }}
          >
            <Trash2 aria-hidden="true" />
            {t('ap.delete')}
          </Button>
        )}
      </div>
    </form>
  )
}
