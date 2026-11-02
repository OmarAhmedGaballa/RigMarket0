import type { Metadata } from 'next'
import Link from 'next/link'
import { CATEGORIES, CATEGORY_GROUPS, categoryName, getCategory, groupName } from '@/lib/categories'
import { getApprovedListings } from '@/lib/queries'
import { getI18n } from '@/lib/i18n/server'
import { ListingCard } from '@/components/listing-card'
import { cn } from '@/lib/utils'

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n()
  return { title: t('meta.browse') }
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>
}) {
  const [{ t, locale }, { category: rawCategory, q: rawQ }] = await Promise.all([getI18n(), searchParams])
  const category = rawCategory && getCategory(rawCategory) ? rawCategory : undefined
  const q = rawQ?.trim().slice(0, 80) || undefined
  const items = await getApprovedListings({ category, q })
  const current = category ? getCategory(category) : undefined

  const linkFor = (slug?: string) => {
    const params = new URLSearchParams()
    if (slug) params.set('category', slug)
    if (q) params.set('q', q)
    const s = params.toString()
    return s ? `/listings?${s}` : '/listings'
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 md:flex-row md:px-6">
      <aside className="md:w-60 md:shrink-0" aria-label={t('listings.categories')}>
        <nav className="flex gap-2 overflow-x-auto pb-2 md:flex-col md:gap-5 md:overflow-visible">
          <Link
            href={linkFor()}
            className={cn(
              'shrink-0 rounded-md px-3 py-1.5 text-sm md:px-2',
              !category ? 'bg-accent font-medium text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {t('listings.all')}
          </Link>
          {CATEGORY_GROUPS.map((group) => (
            <div key={group} className="contents md:block">
              <p className="hidden px-2 pb-1 text-xs font-medium text-muted-foreground md:block">
                {groupName(group, locale)}
              </p>
              <ul className="contents md:flex md:flex-col md:gap-0.5">
                {CATEGORIES.filter((c) => c.group === group).map((c) => (
                  <li key={c.slug} className="shrink-0">
                    <Link
                      href={linkFor(c.slug)}
                      aria-current={category === c.slug ? 'page' : undefined}
                      className={cn(
                        'block rounded-md px-3 py-1.5 text-sm md:px-2',
                        category === c.slug
                          ? 'bg-accent font-medium text-foreground'
                          : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      {categoryName(c, locale)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      <section className="flex-1">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {current ? categoryName(current, locale) : t('listings.allListings')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t(items.length === 1 ? 'listings.result.one' : 'listings.result.other', { n: items.length })}
            {q ? ` ${t('listings.resultsFor', { q })}` : ''}
          </p>
        </div>
        {items.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed p-10 text-center text-muted-foreground">
            {t('listings.empty')}
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
