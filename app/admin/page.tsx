import type { Metadata } from 'next'
import Link from 'next/link'
import { requireAdmin } from '@/lib/session'
import { getListingsForAdmin, getStatusCounts } from '@/lib/queries'
import { getI18n } from '@/lib/i18n/server'
import { AdminNav } from '@/components/admin-nav'
import { AdminReviewCard } from '@/components/admin-review-card'
import { cn } from '@/lib/utils'

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n()
  return { title: t('meta.admin') }
}

const TABS = ['pending', 'approved', 'declined'] as const
type TabValue = (typeof TABS)[number]

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  await requireAdmin()
  const { tab } = await searchParams
  const active: TabValue = TABS.includes(tab as TabValue) ? (tab as TabValue) : 'pending'
  const [{ t }, rows, counts] = await Promise.all([getI18n(), getListingsForAdmin(active), getStatusCounts()])

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">{t('admin.title')}</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">{t('admin.subtitle')}</p>
      <AdminNav active="ads" />

      <nav className="flex gap-1 rounded-lg border bg-card p-1" aria-label={t('admin.tabs.label')}>
        {TABS.map((value) => (
          <Link
            key={value}
            href={`/admin?tab=${value}`}
            aria-current={active === value ? 'page' : undefined}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors',
              active === value ? 'bg-accent font-medium text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {t(`admin.tab.${value}`)}
            <span className="rounded-full bg-muted px-1.5 font-mono text-xs">{counts[value]}</span>
          </Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed p-10 text-center text-muted-foreground">{t('admin.none')}</div>
      ) : (
        <ul className="mt-6 flex flex-col gap-4">
          {rows.map((r) => (
            <li key={r.listing.id}>
              <AdminReviewCard
                listing={r.listing}
                sellerName={r.sellerName}
                sellerEmail={r.sellerEmail}
                sellerPhone={r.sellerPhone}
                sellerIdImageId={r.sellerIdImageId}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
