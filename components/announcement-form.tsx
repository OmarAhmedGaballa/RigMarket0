'use client'

import { useState } from 'react'
import { useActionState } from 'react'
import { removeAnnouncement, saveAnnouncement } from '@/app/actions/announcement'
import { useFormAction } from '@/lib/use-form-action'
import { ANNOUNCEMENT_MAX_LENGTH } from '@/lib/announcement-shared'
import { useI18n } from '@/components/i18n-provider'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function AnnouncementForm({ current }: { current: { text: string; until: string } | null }) {
  const { t, date } = useI18n()
  const { state, onSubmit, pending } = useFormAction(saveAnnouncement)
  const [removeState, remove, removing] = useActionState(removeAnnouncement, undefined)
  const [value, setValue] = useState(current?.text ?? '')

  return (
    <section className="mt-6 flex flex-col gap-4 rounded-xl border bg-card p-5">
      <div>
        <h2 className="font-medium">{t('an.title')}</h2>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t('an.hint')}</p>
      </div>

      {current ? (
        <p className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm">
          {t('an.live', { date: date(current.until) })}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">{t('an.none')}</p>
      )}

      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="ann-text">{t('an.text')}</Label>
          <Textarea
            id="ann-text"
            name="text"
            required
            rows={3}
            maxLength={ANNOUNCEMENT_MAX_LENGTH}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            {value.length}/{ANNOUNCEMENT_MAX_LENGTH}
          </p>
        </div>
        {state?.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
        {state?.success && <p role="status" className="text-sm text-success">{state.success}</p>}
        <Button type="submit" disabled={pending} className="self-start">
          {current ? t('an.update') : t('an.publish')}
        </Button>
      </form>

      {current && (
        <form action={remove}>
          <Button type="submit" variant="outline" disabled={removing}>
            {t('an.remove')}
          </Button>
          {removeState?.success && <p role="status" className="mt-2 text-sm text-success">{removeState.success}</p>}
        </form>
      )}
    </section>
  )
}
