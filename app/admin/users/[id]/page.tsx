import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { requireAdmin } from '@/lib/session'
import { getUserForAdmin } from '@/lib/queries'
import { categoryName, getCategory } from '@/lib/categories'
import { formatDate, formatPrice } from '@/lib/i18n'
import { getI18n } from '@/lib/i18n/server'
import { AdminNav } from '@/components/admin-nav'
import { OrderStatusBadge, StatusBadge } from '@/components/status-badge'
import { ResetPasswordForm } from '@/components/reset-password-form'

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n()
  return { title: t('meta.admin') }
}

function Section({ title, count, children }: { title: string; count?: number; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 flex items-center gap-2 font-medium">
        {title}
        {count !== undefined && <span className="rounded-full bg-muted px-2 font-mono text-xs">{count}</span>}
      </h2>
      {children}
    </section>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium">{children}</dd>
    </div>
  )
}

export default async function AdminUserPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params
  const [{ t, locale }, data] = await Promise.all([getI18n(), getUserForAdmin(id)])
  if (!data) notFound()
  const { user: u, ads, purchases, sales } = data
  const money = (n: number) => formatPrice(n, locale)
  const orderPhones = [...new Set(purchases.map((o) => o.phone))]

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
      <Link href="/admin/users" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4 rtl:rotate-180" aria-hidden="true" />
        {t('au.back')}
      </Link>
      <h1 className="mt-4 mb-6 text-2xl font-semibold tracking-tight">{u.name}</h1>
      <AdminNav active="users" />

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-xl border bg-card p-5">
          <h2 className="mb-4 font-medium">{t('au.personal')}</h2>
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <Field label={t('au.name')}>{u.name}</Field>
            <Field label={t('au.email')}>
              <bdi dir="ltr" className="select-all">{u.email}</bdi>
            </Field>
            <Field label={t('au.phone')}>
              {u.phone ? <bdi dir="ltr" className="font-mono select-all">{u.phone}</bdi> : <span className="text-muted-foreground">{t('au.noPhone')}</span>}
            </Field>
            <Field label={t('au.joined')}>{formatDate(u.createdAt, locale)}</Field>
            <Field label={t('au.role.user')}>{t(u.role === 'admin' ? 'au.role.admin' : 'au.role.user')}</Field>
            <Field label={t('au.viewId')}>
              {u.idImageId ? (
                <a href={`/api/images/${u.idImageId}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  {t('au.viewId')}
                </a>
              ) : (
                <span className="text-muted-foreground">{t('au.noId')}</span>
              )}
            </Field>
            {orderPhones.length > 0 && (
              <div className="sm:col-span-2">
                <dt className="text-xs text-muted-foreground">{t('au.orderPhones')}</dt>
                <dd className="mt-0.5 flex flex-wrap gap-x-4 font-mono">
                  {orderPhones.map((p) => (
                    <bdi key={p} dir="ltr" className="select-all">{p}</bdi>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        </section>

        <section className="rounded-xl border bg-card p-5">
          <h2 className="mb-1 font-medium">{t('au.password')}</h2>
          <p className="font-mono text-sm text-muted-foreground">••••••••</p>
          <p className="mt-1 text-xs text-muted-foreground">{t('au.pwHidden')}</p>
          <p className="mt-3 mb-3 text-xs text-muted-foreground">{t('au.pwNote')}</p>
          <ResetPasswordForm userId={u.id} />
        </section>
      </div>

      <Section title={t('au.sectionAds')} count={ads.length}>
        {ads.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('au.noneAds')}</p>
        ) : (
          <ul className="divide-y rounded-xl border bg-card">
            {ads.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-sm">
                <Link href={`/admin/listings/${a.id}/edit`} className="min-w-0 flex-1 font-medium hover:text-primary">
                  <span className="line-clamp-1">{a.title}</span>
                  <span className="text-xs font-normal text-muted-foreground">{categoryName(getCategory(a.category), locale)}</span>
                </Link>
                <StatusBadge status={a.status} />
                <span className="font-mono text-xs text-muted-foreground">
                  {t('au.sellerPrice')}: {money(a.sellerPrice ?? a.price)}
                </span>
                <span className="font-mono font-semibold text-primary">{money(a.price)}</span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title={t('au.sectionBuy')} count={purchases.length}>
        {purchases.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('au.noneBuy')}</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {purchases.map((o) => (
              <li key={o.id} className="rounded-xl border bg-card p-4 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="flex items-center gap-2 font-medium">
                    <Link href={`/orders/${o.id}`} className="text-primary hover:underline">#{o.id}</Link>
                    <OrderStatusBadge status={o.status} />
                    <span className="text-xs font-normal text-muted-foreground">{formatDate(o.createdAt, locale)}</span>
                  </p>
                  <p className="font-mono font-semibold">{money(o.total)}</p>
                </div>
                <ul className="mt-2 text-muted-foreground">
                  {o.items.map((i) => (
                    <li key={i.id} className="flex justify-between gap-3">
                      <span className="line-clamp-1">{i.title} × {i.quantity}</span>
                      <span className="font-mono">{money(i.price * i.quantity)}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title={t('au.sectionSell')} count={sales.length}>
        {sales.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('au.noneSell')}</p>
        ) : (
          <ul className="divide-y rounded-xl border bg-card">
            {sales.map(({ item, order, buyerName }) => (
              <li key={item.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-sm">
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 font-medium">{item.title} × {item.quantity}</p>
                  <p className="text-xs text-muted-foreground">
                    <Link href={`/orders/${order.id}`} className="text-primary hover:underline">#{order.id}</Link>
                    {' · '}
                    {buyerName ?? order.fullName} · {formatDate(order.createdAt, locale)}
                  </p>
                </div>
                <OrderStatusBadge status={order.status} />
                <span className="font-mono text-xs text-muted-foreground">
                  {t('sl.sellerGets')}: {money((item.sellerUnitPrice ?? item.price) * item.quantity)}
                </span>
                <span className="font-mono font-semibold">{money(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  )
}
