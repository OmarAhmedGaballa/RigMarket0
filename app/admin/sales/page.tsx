import type { Metadata } from 'next'
import Link from 'next/link'
import { requireAdmin } from '@/lib/session'
import { getAdminStats, getSalesForAdmin, type SalesFilter } from '@/lib/queries'
import { formatDate, formatPrice } from '@/lib/i18n'
import { getI18n } from '@/lib/i18n/server'
import { AdminNav } from '@/components/admin-nav'
import { AdminStats } from '@/components/admin-stats'
import { OrderStatusBadge } from '@/components/status-badge'
import { cn } from '@/lib/utils'

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n()
  return { title: t('meta.admin') }
}

const FILTERS: SalesFilter[] = ['all', 'active', 'cancelled']

export default async function AdminSalesPage({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  await requireAdmin()
  const { f } = await searchParams
  const filter: SalesFilter = FILTERS.includes(f as SalesFilter) ? (f as SalesFilter) : 'all'
  const [{ t, locale }, rows, stats] = await Promise.all([getI18n(), getSalesForAdmin(filter), getAdminStats()])
  const money = (n: number) => formatPrice(n, locale)

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">{t('sl.title')}</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">{t('sl.subtitle')}</p>
      <AdminNav active="sales" />

      <AdminStats
        items={[
          { label: t('st.gross'), value: money(stats.gross), tone: 'primary' },
          { label: t('st.sellerNet'), value: money(stats.sellerNet) },
          { label: t('st.commission'), value: money(stats.commission), tone: 'success' },
          { label: t('st.orders'), value: stats.orders },
        ]}
      />

      <nav className="mb-4 flex gap-1 rounded-lg border bg-card p-1 sm:max-w-sm" aria-label={t('sl.title')}>
        {FILTERS.map((value) => (
          <Link
            key={value}
            href={value === 'all' ? '/admin/sales' : `/admin/sales?f=${value}`}
            aria-current={filter === value ? 'page' : undefined}
            className={cn(
              'flex-1 rounded-md px-3 py-1.5 text-center text-sm transition-colors',
              filter === value ? 'bg-accent font-medium text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {t(`sl.f.${value}`)}
          </Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">{t('sl.empty')}</div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border bg-card">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="border-b bg-muted/60 text-xs text-muted-foreground">
                <tr className="text-start">
                  {(['date', 'order', 'item', 'buyer', 'seller', 'qty', 'total', 'sellerGets', 'commission', 'status'] as const).map((c) => (
                    <th key={c} className="px-3 py-2.5 text-start font-medium">
                      {t(`sl.${c}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map(({ item, order, buyerName, buyerEmail, sellerName, sellerPhone }) => {
                  const total = item.price * item.quantity
                  const net = (item.sellerUnitPrice ?? item.price) * item.quantity
                  return (
                    <tr key={item.id} className={cn('align-top', order.status === 'cancelled' && 'opacity-60')}>
                      <td className="px-3 py-2.5 text-xs whitespace-nowrap text-muted-foreground">{formatDate(order.createdAt, locale)}</td>
                      <td className="px-3 py-2.5 font-mono whitespace-nowrap">
                        <Link href={`/orders/${order.id}`} className="text-primary hover:underline">
                          #{order.id}
                        </Link>
                      </td>
                      <td className="max-w-56 px-3 py-2.5">
                        <p className="line-clamp-2">{item.title}</p>
                      </td>
                      <td className="px-3 py-2.5">
                        <p className="font-medium">{order.fullName}</p>
                        <bdi dir="ltr" className="block font-mono text-xs text-muted-foreground select-all">{order.phone}</bdi>
                        {buyerEmail && buyerEmail !== '' && <bdi dir="ltr" className="block text-xs text-muted-foreground">{buyerEmail}</bdi>}
                        {buyerName && buyerName !== order.fullName && <span className="text-xs text-muted-foreground">({buyerName})</span>}
                      </td>
                      <td className="px-3 py-2.5">
                        <p className="font-medium">{sellerName ?? t('sl.deleted')}</p>
                        {sellerPhone && <bdi dir="ltr" className="block font-mono text-xs text-muted-foreground select-all">{sellerPhone}</bdi>}
                      </td>
                      <td className="px-3 py-2.5 font-mono">{item.quantity}</td>
                      <td className="px-3 py-2.5 font-mono whitespace-nowrap">{money(total)}</td>
                      <td className="px-3 py-2.5 font-mono whitespace-nowrap">{money(net)}</td>
                      <td className="px-3 py-2.5 font-mono whitespace-nowrap text-success">{money(total - net)}</td>
                      <td className="px-3 py-2.5">
                        <OrderStatusBadge status={order.status} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {rows.length >= 500 && <p className="mt-2 text-xs text-muted-foreground">{t('sl.limit')}</p>}
        </>
      )}
    </div>
  )
}
