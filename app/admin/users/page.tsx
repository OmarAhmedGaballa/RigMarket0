import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, IdCard, Mail, Phone } from 'lucide-react'
import { requireAdmin } from '@/lib/session'
import { getAdminStats, getUsersForAdmin } from '@/lib/queries'
import { formatDate, formatPrice } from '@/lib/i18n'
import { getI18n } from '@/lib/i18n/server'
import { AdminNav } from '@/components/admin-nav'
import { AdminStats } from '@/components/admin-stats'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n()
  return { title: t('meta.admin') }
}

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireAdmin()
  const { q: rawQ } = await searchParams
  const q = rawQ?.trim().slice(0, 80) || undefined
  const [{ t, locale }, users, stats] = await Promise.all([getI18n(), getUsersForAdmin(q), getAdminStats()])

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">{t('au.title')}</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">{t('au.subtitle')}</p>
      <AdminNav active="users" />

      <AdminStats
        items={[
          { label: t('st.users'), value: stats.users },
          { label: t('st.sellers'), value: stats.sellers },
          { label: t('st.adsLive'), value: stats.adsLive },
          { label: t('st.orders'), value: stats.orders },
        ]}
      />

      <form className="mb-6 flex gap-2" role="search">
        <Input name="q" defaultValue={q} placeholder={t('au.search')} className="max-w-sm" />
        <Button type="submit">{t('au.searchBtn')}</Button>
      </form>

      {users.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">{t('au.empty')}</div>
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {users.map((u) => (
            <li key={u.id}>
              <Link
                href={`/admin/users/${u.id}`}
                className="group flex flex-col gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-primary/50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 font-medium">
                      <span className="truncate">{u.name}</span>
                      <span
                        className={
                          'rounded-full border px-2 py-0.5 text-xs ' +
                          (u.role === 'admin' ? 'border-primary/30 bg-primary/10 text-primary' : 'bg-muted text-muted-foreground')
                        }
                      >
                        {t(u.role === 'admin' ? 'au.role.admin' : 'au.role.user')}
                      </span>
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Mail className="size-3.5 shrink-0" aria-hidden="true" />
                      <bdi dir="ltr" className="truncate select-all">{u.email}</bdi>
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Phone className="size-3.5 shrink-0" aria-hidden="true" />
                      {u.phone ? <bdi dir="ltr" className="font-mono select-all">{u.phone}</bdi> : <span>{t('au.noPhone')}</span>}
                      {u.idImageId && <IdCard className="size-3.5 text-success" aria-label={t('au.viewId')} />}
                    </p>
                  </div>
                  <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground group-hover:text-primary rtl:rotate-180" aria-hidden="true" />
                </div>
                <dl className="grid grid-cols-4 gap-2 rounded-lg bg-muted/60 p-2.5 text-center text-xs">
                  <div>
                    <dt className="text-muted-foreground">{t('au.ads')}</dt>
                    <dd className="font-mono text-sm font-semibold">{u.adsCount}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">{t('au.orders')}</dt>
                    <dd className="font-mono text-sm font-semibold">{u.ordersCount}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">{t('au.spent')}</dt>
                    <dd className="font-mono text-sm font-semibold">{formatPrice(u.spent, locale)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">{t('au.sold')}</dt>
                    <dd className="font-mono text-sm font-semibold">{formatPrice(u.soldTotal, locale)}</dd>
                  </div>
                </dl>
                <p className="text-xs text-muted-foreground">
                  {t('au.joined')}: {formatDate(u.createdAt, locale)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
