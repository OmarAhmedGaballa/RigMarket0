'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { ClipboardList, LayoutList, LogIn, Menu, Search, ShieldCheck, Store, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SignOutButton } from '@/components/sign-out-button'
import { useI18n } from '@/components/i18n-provider'

export function MobileMenu({ signedIn, isAdmin }: { signedIn: boolean; isAdmin: boolean }) {
  const { t } = useI18n()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => setOpen(false), [pathname])

  const item = 'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-muted'

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        aria-label={t('nav.menu')}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
      </Button>
      {open && (
        <div
          id="mobile-menu"
          className="fixed inset-x-0 top-16 z-40 max-h-[calc(100dvh-4rem)] overflow-y-auto border-b bg-background p-3 shadow-lg"
        >
          <form action="/listings" role="search" className="relative mb-2">
            <label htmlFor="mobile-search" className="sr-only">
              {t('search.label')}
            </label>
            <Search
              className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              id="mobile-search"
              name="q"
              placeholder={t('search.placeholder')}
              className="h-10 w-full rounded-lg border bg-card pe-3 ps-9 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
          </form>
          <nav aria-label={t('nav.menu')} className="flex flex-col">
            <Link href="/listings" className={item}>
              <Store className="size-4 text-muted-foreground" aria-hidden="true" />
              {t('nav.browse')}
            </Link>
            {signedIn && (
              <>
                <Link href="/orders" className={item}>
                  <ClipboardList className="size-4 text-muted-foreground" aria-hidden="true" />
                  {t('nav.myOrders')}
                </Link>
                <Link href="/dashboard" className={item}>
                  <LayoutList className="size-4 text-muted-foreground" aria-hidden="true" />
                  {t('nav.myAds')}
                </Link>
              </>
            )}
            {isAdmin && (
              <Link href="/admin" className={item}>
                <ShieldCheck className="size-4 text-muted-foreground" aria-hidden="true" />
                {t('nav.admin')}
              </Link>
            )}
            {signedIn ? (
              <SignOutButton showLabel className="w-full justify-start px-3 py-2.5 text-sm" />
            ) : (
              <Link href="/sign-in" className={item}>
                <LogIn className="size-4 text-muted-foreground rtl:-scale-x-100" aria-hidden="true" />
                {t('nav.signIn')}
              </Link>
            )}
          </nav>
        </div>
      )}
    </div>
  )
}
