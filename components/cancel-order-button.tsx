'use client'

import { useTransition } from 'react'
import { cancelMyOrder } from '@/app/actions/orders'
import { useI18n } from '@/components/i18n-provider'
import { Button } from '@/components/ui/button'

export function CancelOrderButton({ orderId }: { orderId: number }) {
  const { t } = useI18n()
  const [pending, startTransition] = useTransition()
  return (
    <Button
      variant="destructive"
      disabled={pending}
      onClick={() => {
        if (confirm(t('orders.cancelConfirm'))) startTransition(() => cancelMyOrder(orderId))
      }}
    >
      {t('orders.cancel')}
    </Button>
  )
}
