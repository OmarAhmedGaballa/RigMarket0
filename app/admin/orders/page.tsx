import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/session'
import { getOrdersForAdmin } from '@/lib/queries'
import { getI18n } from '@/lib/i18n/server'
import { AdminNav } from '@/components/admin-nav'
import { AdminOrderCard } from '@/components/admin-order-card'

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n()
  return { title: t('meta.admin') }
}

export default async function AdminOrdersPage() {
  await requireAdmin()
  const [{ t }, orders] = await Promise.all([getI18n(), getOrdersForAdmin()])

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">{t('ao.title')}</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">{t('ao.subtitle')}</p>
      <AdminNav active="orders" />
      {orders.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">{t('ao.empty')}</div>
      ) : (
        <ul className="flex flex-col gap-4">
          {orders.map((o) => {
            const { items, ...order } = o
            return (
              <li key={order.id}>
                <AdminOrderCard order={order} items={items} />
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
