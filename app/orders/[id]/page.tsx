import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, MessageCircle } from 'lucide-react'
import { requireUser } from '@/lib/session'
import { getOrderForUser } from '@/lib/queries'
import { formatDate, formatPrice } from '@/lib/i18n'
import { getI18n } from '@/lib/i18n/server'
import { SUPPORT_WHATSAPP_DISPLAY, whatsappLink } from '@/lib/config'
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/status-badge'
import { ClearCartOnMount } from '@/components/clear-cart'
import { CancelOrderButton } from '@/components/cancel-order-button'
import { buttonVariants } from '@/components/ui/button'

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n()
  return { title: t('meta.orders') }
}

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ placed?: string }>
}) {
  const [{ id }, { placed }, user, { t, locale }] = await Promise.all([params, searchParams, requireUser(), getI18n()])
  const numericId = Number(id)
  if (!Number.isInteger(numericId)) notFound()
  const order = await getOrderForUser(numericId, user.id, user.role === 'admin')
  if (!order) notFound()

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      {placed && <ClearCartOnMount />}
      <Link href="/orders" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4 rtl:rotate-180" aria-hidden="true" />
        {t('orders.title')}
      </Link>

      {placed && (
        <div role="status" className="mt-4 rounded-xl border border-success/30 bg-success/10 p-4">
          <p className="font-medium text-success">{t('orders.placed.title')}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t('orders.placed.text')}</p>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">{t('orders.number', { id: order.id })}</h1>
        <OrderStatusBadge status={order.status} />
        <PaymentStatusBadge status={order.paymentStatus} />
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{formatDate(order.createdAt, locale)}</p>

      <section className="mt-6 rounded-xl border bg-card p-5" aria-labelledby="items-heading">
        <h2 id="items-heading" className="font-medium">
          {t('orders.items')}
        </h2>
        <ul className="mt-4 flex flex-col gap-4">
          {order.items.map((i) => (
            <li key={i.id} className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={i.imageUrl || '/images/cat-parts.png'} alt="" className="size-14 shrink-0 rounded-lg border object-cover" />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-medium">{i.title}</p>
                <p className="text-xs text-muted-foreground">{t('orders.qty', { n: i.quantity })}</p>
              </div>
              <p className="shrink-0 font-mono text-sm">{formatPrice(i.price * i.quantity, locale)}</p>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-baseline justify-between border-t pt-4">
          <span className="font-medium">{t('cart.total')}</span>
          <span className="font-mono text-xl font-semibold text-primary">{formatPrice(order.total, locale)}</span>
        </div>
      </section>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <section className="rounded-xl border bg-card p-5 text-sm">
          <h2 className="font-medium">{t('orders.shipTo')}</h2>
          <p className="mt-2">{order.fullName}</p>
          <p className="text-muted-foreground">
            {order.city}, {order.address}
          </p>
          <p className="mt-1 text-muted-foreground" dir="ltr">
            <bdi>{order.phone}</bdi>
          </p>
        </section>
        <section className="rounded-xl border bg-card p-5 text-sm">
          <h2 className="font-medium">{t('orders.payment')}</h2>
          <p className="mt-2">{order.paymentMethodName}</p>
          {order.paymentReference && (
            <p className="text-muted-foreground">
              {t('orders.reference')}: <bdi dir="ltr">{order.paymentReference}</bdi>
            </p>
          )}
        </section>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {order.status === 'placed' && order.userId === user.id && <CancelOrderButton orderId={order.id} />}
        <a
          href={whatsappLink(`${t('wa.greeting')} #${order.id}`)}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ variant: 'outline' })}
        >
          <MessageCircle aria-hidden="true" />
          {t('footer.support.cta')}
        </a>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        {t('orders.help')} {t('wa.note')} · <bdi dir="ltr">{SUPPORT_WHATSAPP_DISPLAY}</bdi>
      </p>
    </div>
  )
}
