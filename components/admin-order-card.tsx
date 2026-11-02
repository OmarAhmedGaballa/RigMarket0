'use client'

import { Phone } from 'lucide-react'
import type { Order, OrderItem } from '@/lib/db/schema'
import { ORDER_STATUSES, PAYMENT_STATUSES } from '@/lib/db/schema'
import { adminUpdateOrder } from '@/app/actions/orders'
import { useFormAction } from '@/lib/use-form-action'
import { useI18n } from '@/components/i18n-provider'
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

const selectClass =
  'h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30 [&>option]:bg-card'

type Props = {
  order: Order
  items: { item: OrderItem; sellerName: string | null; sellerPhone: string | null }[]
}

export function AdminOrderCard({ order, items }: Props) {
  const { t, price, date } = useI18n()
  const { state, onSubmit, pending } = useFormAction(adminUpdateOrder)
  const cancelled = order.status === 'cancelled'

  return (
    <article className="flex flex-col gap-4 rounded-xl border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-medium">{t('orders.number', { id: order.id })}</h2>
          <OrderStatusBadge status={order.status} />
          <PaymentStatusBadge status={order.paymentStatus} />
        </div>
        <div className="text-end">
          <p className="font-mono text-lg font-semibold text-primary">{price(order.total)}</p>
          <p className="text-xs text-muted-foreground">{date(order.createdAt)}</p>
        </div>
      </div>

      <div className="grid gap-3 rounded-lg bg-muted/60 p-3 text-sm sm:grid-cols-2">
        <div>
          <p className="text-xs text-muted-foreground">{t('ao.buyer')}</p>
          <p className="font-medium">{order.fullName}</p>
          <bdi dir="ltr" className="font-mono text-xs select-all">
            {order.phone}
          </bdi>
          <p className="mt-1 text-muted-foreground">
            {order.city}, {order.address}
          </p>
          {order.notes && <p className="mt-1 text-xs text-muted-foreground">“{order.notes}”</p>}
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t('orders.payment')}</p>
          <p className="font-medium">{order.paymentMethodName}</p>
          {order.paymentReference && (
            <p className="text-muted-foreground">
              {t('orders.reference')}: <bdi dir="ltr" className="font-mono select-all">{order.paymentReference}</bdi>
            </p>
          )}
        </div>
      </div>

      <ul className="flex flex-col gap-3">
        {items.map(({ item, sellerName, sellerPhone }) => (
          <li key={item.id} className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.imageUrl || '/images/cat-parts.png'} alt="" className="size-12 shrink-0 rounded-lg border object-cover" />
            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 text-sm font-medium">{item.title}</p>
              <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                <span>{t('orders.qty', { n: item.quantity })}</span>
                <span>· {t('ao.sellerPhone')}: {sellerName ?? t('ao.deleted')}</span>
                {sellerPhone && (
                  <span className="inline-flex items-center gap-1">
                    <Phone className="size-3" aria-hidden="true" />
                    <bdi dir="ltr" className="font-mono select-all">{sellerPhone}</bdi>
                  </span>
                )}
              </p>
            </div>
            <p className="shrink-0 font-mono text-sm">{price(item.price * item.quantity)}</p>
          </li>
        ))}
      </ul>

      <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-3 border-t pt-4">
        <input type="hidden" name="id" value={order.id} />
        <div className="flex min-w-40 flex-col gap-1.5">
          <Label htmlFor={`os-${order.id}`}>{t('orders.status')}</Label>
          <select id={`os-${order.id}`} name="status" defaultValue={order.status} disabled={cancelled} className={selectClass}>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {t(`status.order.${s}`)}
              </option>
            ))}
          </select>
          {cancelled && <input type="hidden" name="status" value="cancelled" />}
        </div>
        <div className="flex min-w-40 flex-col gap-1.5">
          <Label htmlFor={`ps-${order.id}`}>{t('orders.paymentStatus')}</Label>
          <select id={`ps-${order.id}`} name="paymentStatus" defaultValue={order.paymentStatus} className={selectClass}>
            {PAYMENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {t(`status.pay.${s}`)}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" disabled={pending || cancelled}>
          {pending ? t('ao.saving') : t('ao.save')}
        </Button>
        {state?.error && (
          <p role="alert" className="w-full text-sm text-destructive">
            {state.error}
          </p>
        )}
        {state?.success && (
          <p role="status" className="w-full text-sm text-success">
            {state.success}
          </p>
        )}
      </form>
    </article>
  )
}
