'use client'

import { saveCommission } from '@/app/actions/settings'
import { formatRate, withCommission } from '@/lib/pricing'
import { useFormAction } from '@/lib/use-form-action'
import { useState } from 'react'
import { useI18n } from '@/components/i18n-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function CommissionForm({ rate }: { rate: number }) {
  const { t, price } = useI18n()
  const { state, onSubmit, pending } = useFormAction(saveCommission)
  const [value, setValue] = useState(formatRate(rate))
  const n = Number(value.replace(',', '.'))

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5 rounded-xl border bg-card p-5">
      <div className="flex flex-col gap-2 sm:max-w-xs">
        <Label htmlFor="rate">{t('as.rate')}</Label>
        <Input
          id="rate"
          name="rate"
          type="text"
          inputMode="decimal"
          required
          value={value}
          onChange={(e) => setValue(e.target.value)}
          dir="ltr"
          className="text-start font-mono"
        />
        <p className="text-xs leading-relaxed text-muted-foreground">{t('as.hint')}</p>
        {Number.isFinite(n) && n >= 0 && (
          <p className="font-mono text-xs text-muted-foreground">
            {price(1000)} → <span className="font-semibold text-foreground">{price(withCommission(1000, n))}</span>
          </p>
        )}
      </div>

      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" name="applyToLive" className="mt-0.5 size-4 accent-[var(--primary)]" />
        <span>
          {t('as.applyLive')}
          <span className="mt-0.5 block text-xs text-muted-foreground">{t('as.applyLiveHint')}</span>
        </span>
      </label>

      {state?.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
      {state?.success && <p role="status" className="text-sm text-success">{state.success}</p>}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? t('as.saving') : t('as.save')}
      </Button>
    </form>
  )
}
