import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, BadgeCheck, ShieldCheck, ShoppingBag } from 'lucide-react'
import { CATEGORIES, CATEGORY_GROUPS, categoryName, groupName } from '@/lib/categories'
import { getApprovedCountsByCategory, getApprovedListings } from '@/lib/queries'
import { getI18n } from '@/lib/i18n/server'
import { ListingCard } from '@/components/listing-card'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default async function HomePage() {
  const [{ t, locale }, latest, counts] = await Promise.all([
    getI18n(),
    getApprovedListings({ limit: 8 }),
    getApprovedCountsByCategory(),
  ])

  const features = [
    { icon: ShieldCheck, title: t('home.f1.title'), text: t('home.f1.text') },
    { icon: ShoppingBag, title: t('home.f2.title'), text: t('home.f2.text') },
    { icon: BadgeCheck, title: t('home.f3.title'), text: t('home.f3.text') },
  ]

  return (
    <>
      <section className="relative overflow-hidden border-b">
        <Image
          src="/images/hero.png"
          alt=""
          fill
          priority
          className="object-cover opacity-35 rtl:-scale-x-100 dark:opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/20 rtl:bg-gradient-to-l" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-6 px-4 py-20 md:px-6 md:py-28">
          <p className="font-mono text-xs tracking-widest text-primary uppercase rtl:tracking-normal">{t('home.badge')}</p>
          <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-balance md:text-5xl rtl:leading-tight">
            {t('home.title')}
          </h1>
          <p className="max-w-lg leading-relaxed text-muted-foreground">{t('home.subtitle')}</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/listings" className={buttonVariants({ size: 'lg' })}>
              {t('home.browse')}
              <ArrowRight className="rtl:rotate-180" aria-hidden="true" />
            </Link>
            <Link href="/sell" className={buttonVariants({ size: 'lg', variant: 'outline' })}>
              {t('home.sell')}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-10 sm:grid-cols-3 md:px-6">
        {features.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex items-start gap-3 rounded-xl border bg-card p-4">
            <Icon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <p className="font-medium">{title}</p>
              <p className="text-sm text-muted-foreground">{text}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 md:px-6" aria-labelledby="categories-heading">
        <h2 id="categories-heading" className="text-2xl font-semibold tracking-tight">
          {t('home.shop')}
        </h2>
        <div className="mt-6 flex flex-col gap-8">
          {CATEGORY_GROUPS.map((group) => (
            <div key={group}>
              <h3 className="mb-3 text-sm font-medium text-muted-foreground">{groupName(group, locale)}</h3>
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {CATEGORIES.filter((c) => c.group === group).map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/listings?category=${c.slug}`}
                      className="group flex items-center gap-3 rounded-xl border bg-card p-3 transition-colors hover:border-primary/50"
                    >
                      <Image
                        src={c.image}
                        alt=""
                        width={48}
                        height={48}
                        className="size-12 shrink-0 rounded-lg object-cover"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{categoryName(c, locale)}</p>
                        <p className="text-xs text-muted-foreground">{t('home.listingsCount', { n: counts[c.slug] ?? 0 })}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 md:px-6" aria-labelledby="latest-heading">
        <div className="flex items-end justify-between">
          <h2 id="latest-heading" className="text-2xl font-semibold tracking-tight">
            {t('home.latest')}
          </h2>
          <Link href="/listings" className={cn(buttonVariants({ variant: 'link' }), 'px-0')}>
            {t('home.viewAll')}
          </Link>
        </div>
        {latest.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed p-10 text-center">
            <p className="font-medium">{t('home.empty.title')}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t('home.empty.text')}</p>
            <Link href="/sell" className={cn(buttonVariants(), 'mt-4')}>
              {t('home.empty.cta')}
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {latest.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}
