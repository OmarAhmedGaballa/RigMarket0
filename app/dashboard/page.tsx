import type { Metadata } from 'next'
import Link from 'next/link'
import { requireUser } from '@/lib/session'
import { getListingsForUser } from '@/lib/queries'
import { getI18n } from '@/lib/i18n/server'
import { SellerListingRow } from '@/components/seller-listing-row'
import { buttonVariants } from '@/components/ui/button'

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n()
  return { title: t('meta.dashboard') }
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ submitted?: string }> }) {
  const user = await requireUser()
  const [{ t }, { submitted }, items] = await Promise.all([getI18n(), searchParams, getListingsForUser(user.id)])

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t('dash.title')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('dash.subtitle')}</p>
        </div>
        <Link href="/sell" className={buttonVariants()}>
          {t('dash.postNew')}
        </Link>
      </div>

      {submitted && (
        <p role="status" className="mt-6 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm">
          {t('dash.submitted')}
        </p>
      )}

      {items.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed p-10 text-center text-muted-foreground">{t('dash.empty')}</div>
      ) : (
        <ul className="mt-8 flex flex-col gap-4">
          {items.map((l) => (
            <li key={l.id}>
              <SellerListingRow listing={l} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
