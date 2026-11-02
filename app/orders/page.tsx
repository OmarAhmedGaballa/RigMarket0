import type { Metadata } from 'next'
import Link from 'next/link'
import { requireUser } from '@/lib/session'
import { getOrdersForUser } from '@/lib/queries'
import { formatDate, formatPrice } from '@/lib/i18n'
import { getI18n } from '@/lib/i18n/server'
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/status-badge'

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n()
  return { title: t('meta.orders') }
}

export default async function OrdersPage() {
  const user = await requireUser('/sign-in?next=/orders')
  const [{ t, locale }, orders] = await Promise.all([getI18n(), getOrdersForUser(user.id)])

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">{t('orders.title')}</h1>
      {orders.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed p-10 text-center text-muted-foreground">{t('orders.empty')}</div>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {orders.map((o) => (
            <li key={o.id}>
              <Link
                href={`/orders/${o.id}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-primary/50"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-medium">{t('orders.number', { id: o.id })}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(o.createdAt, locale)} · {t('cart.items', { n: o.items.reduce((n, i) => n + i.quantity, 0) })}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <OrderStatusBadge status={o.status} />
                  <PaymentStatusBadge status={o.paymentStatus} />
                  <span className="font-mono font-semibold text-primary">{formatPrice(o.total, locale)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
