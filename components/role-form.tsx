'use client'

import { setAccountRole } from '@/app/actions/admin-users'
import { useFormAction } from '@/lib/use-form-action'
import { useI18n } from '@/components/i18n-provider'
import { Button } from '@/components/ui/button'

/** Only rendered for the primary admin. Promotes a member to admin, or takes admin back. */
export function RoleForm({ userId, isAdmin }: { userId: string; isAdmin: boolean }) {
  const { t } = useI18n()
  const { state, onSubmit, pending } = useFormAction(setAccountRole)
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <input type="hidden" name="id" value={userId} />
      <input type="hidden" name="role" value={isAdmin ? 'user' : 'admin'} />
      {state?.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
      {state?.success && <p role="status" className="text-sm text-success">{state.success}</p>}
      <Button
        type="submit"
        variant={isAdmin ? 'outline' : 'default'}
        disabled={pending}
        className="self-start"
        onClick={(e) => {
          if (!confirm(isAdmin ? t('ro.confirmDemote') : t('ro.confirmPromote'))) e.preventDefault()
        }}
      >
        {isAdmin ? t('ro.demote') : t('ro.promote')}
      </Button>
    </form>
  )
}
