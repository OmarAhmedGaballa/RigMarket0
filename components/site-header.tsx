import Link from 'next/link'
import { Cpu, Plus, ShieldCheck, Search } from 'lucide-react'
import { getCurrentUser } from '@/lib/session'
import { getI18n } from '@/lib/i18n/server'
import { buttonVariants } from '@/components/ui/button'
import { SignOutButton } from '@/components/sign-out-button'
import { ThemeToggle } from '@/components/theme-toggle'
import { LocaleSwitch } from '@/components/locale-switch'
import { CartLink } from '@/components/cart-link'
import { MobileMenu } from '@/components/mobile-menu'
import { cn } from '@/lib/utils'

export async function SiteHeader() {
  const [user, { t }] = await Promise.all([getCurrentUser(), getI18n()])
  const isAdmin = user?.role === 'admin'

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-3 md:gap-3 md:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-semibold tracking-tight">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Cpu className="size-4" aria-hidden="true" />
          </span>
          <span className="hidden min-[400px]:inline">RigMarket</span>
        </Link>

        <form action="/listings" className="relative hidden flex-1 md:block md:max-w-md" role="search">
          <label htmlFor="header-search" className="sr-only">
            {t('search.label')}
          </label>
          <Search
            className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id="header-search"
            name="q"
            placeholder={t('search.placeholder')}
            className="h-9 w-full rounded-lg border bg-card pe-3 ps-9 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </form>

        <nav className="ms-auto flex items-center gap-0.5 md:gap-1" aria-label={t('nav.main')}>
          <Link href="/listings" className={cn(buttonVariants({ variant: 'ghost' }), 'hidden md:inline-flex')}>
            {t('nav.browse')}
          </Link>
          {isAdmin && (
            <Link href="/admin" className={cn(buttonVariants({ variant: 'ghost' }), 'hidden md:inline-flex')}>
              <ShieldCheck aria-hidden="true" />
              {t('nav.admin')}
            </Link>
          )}
          {user && (
            <>
              <Link href="/orders" className={cn(buttonVariants({ variant: 'ghost' }), 'hidden lg:inline-flex')}>
                {t('nav.myOrders')}
              </Link>
              <Link href="/dashboard" className={cn(buttonVariants({ variant: 'ghost' }), 'hidden lg:inline-flex')}>
                {t('nav.myAds')}
              </Link>
            </>
          )}
          <CartLink />
          <LocaleSwitch />
          <ThemeToggle />
          {user ? (
            <span className="hidden md:inline-flex">
              <SignOutButton />
            </span>
          ) : (
            <Link href="/sign-in" className={cn(buttonVariants({ variant: 'ghost' }), 'hidden md:inline-flex')}>
              {t('nav.signIn')}
            </Link>
          )}
          <Link
            href="/sell"
            aria-label={t('nav.postAd')}
            className={cn(buttonVariants(), 'ms-1 max-sm:size-8 max-sm:px-0')}
          >
            <Plus aria-hidden="true" />
            <span className="hidden sm:inline">{t('nav.postAd')}</span>
          </Link>
          <MobileMenu signedIn={!!user} isAdmin={isAdmin} />
        </nav>
      </div>
    </header>
  )
}
