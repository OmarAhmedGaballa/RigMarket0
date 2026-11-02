'use client'

import { ShieldCheck } from 'lucide-react'
import { saveSellerVerification } from '@/app/actions/seller'
import { useFormAction } from '@/lib/use-form-action'
import { useI18n } from '@/components/i18n-provider'
import { ImageInput } from '@/components/image-input'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function SellerVerificationForm({ defaultPhone, hasId }: { defaultPhone: string; hasId: boolean }) {
  const { t } = useI18n()
  const { state, onSubmit, pending } = useFormAction(saveSellerVerification)

  return (
    <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-5 rounded-xl border bg-card p-5">
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
        <div>
          <h2 className="font-medium">{t('verify.title')}</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t('verify.text')}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="phone">{t('verify.phone')}</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          dir="ltr"
          required
          maxLength={30}
          autoComplete="tel"
          defaultValue={defaultPhone}
          placeholder="01XXXXXXXXX"
          className="max-w-xs text-start"
        />
        <p className="text-xs text-muted-foreground">{t('verify.phoneHint')}</p>
      </div>

      <ImageInput name="idPhoto" label={t('verify.idPhoto')} hint={t('verify.idHint')} required={!hasId} hidePreview />

      {state?.error && (
        <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={pending} className="self-start">
        {pending ? t('verify.saving') : t('verify.save')}
      </Button>
    </form>
  )
}
