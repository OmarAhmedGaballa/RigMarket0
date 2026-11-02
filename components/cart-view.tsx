'use client'

import Link from 'next/link'
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react'
import { useCart } from '@/components/cart-provider'
import { useCartSync } from '@/components/use-cart-sync'
import { useI18n } from '@/components/i18n-provider'
import { Button, buttonVariants } from '@/components/ui/button'

export function CartView() {
  const { lines, hydrated, total, count, setQty, remove, clear } = useCart()
  const { checking } = useCartSync()
  const { t, price } = useI18n()

  if (!hydrated) return <div className="mt-8 h-40 animate-pulse rounded-xl bg-muted" aria-hidden="true" />

  if (lines.length === 0) {
    return (
      <div className="mt-8 flex flex-col items-center gap-3 rounded-xl border border-dashed p-12 text-center">
        <ShoppingCart className="size-8 text-muted-foreground" aria-hidden="true" />
        <p className="font-medium">{t('cart.empty')}</p>
        <p className="text-sm text-muted-foreground">{t('cart.emptyText')}</p>
        <Link href="/listings" className={buttonVariants({ className: 'mt-2' })}>
          {t('cart.continue')}
        </Link>
      </div>
    )
  }

  const blocked = lines.some((l) => l.stock <= 0)

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
      <ul className="flex flex-col gap-3">
        {lines.map((l) => {
          const out = l.stock <= 0
          return (
            <li key={l.id} className="flex gap-4 rounded-xl border bg-card p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={l.image} alt="" className="size-20 shrink-0 rounded-lg border object-cover" />
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <Link href={`/listings/${l.id}`} className="line-clamp-2 font-medium hover:text-primary">
                  {l.title}
                </Link>
                <p className="font-mono text-sm font-semibold text-primary">{price(l.price)}</p>
                {out ? (
                  <p role="alert" className="text-sm text-destructive">
                    {t('cart.unavailable')}
                  </p>
                ) : (
                  <div className="flex items-center gap-1" role="group" aria-label={t('cart.qty')}>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      aria-label={t('cart.decrease')}
                      disabled={l.qty <= 1}
                      onClick={() => setQty(l.id, l.qty - 1)}
                    >
                      <Minus aria-hidden="true" />
                    </Button>
                    <span className="w-8 text-center font-mono text-sm" aria-live="polite">
                      {l.qty}
                    </span>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      aria-label={t('cart.increase')}
                      disabled={l.qty >= l.stock}
                      onClick={() => setQty(l.id, l.qty + 1)}
                    >
                      <Plus aria-hidden="true" />
                    </Button>
                    {l.qty >= l.stock && (
                      <span className="ms-2 text-xs text-muted-foreground">{t('cart.maxStock', { n: l.stock })}</span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end justify-between">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={t('cart.remove', { title: l.title })}
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => remove(l.id)}
                >
                  <Trash2 aria-hidden="true" />
                </Button>
                {!out && <p className="font-mono text-sm font-semibold">{price(l.price * l.qty)}</p>}
              </div>
            </li>
          )
        })}
      </ul>

      <aside className="h-fit rounded-xl border bg-card p-5 lg:sticky lg:top-24">
        <dl className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">{t('cart.items', { n: count })}</dt>
          </div>
          <div className="flex items-baseline justify-between border-t pt-3">
            <dt className="font-medium">{t('cart.total')}</dt>
            <dd className="font-mono text-xl font-semibold text-primary">{price(total)}</dd>
          </div>
        </dl>
        {checking && <p className="mt-3 text-xs text-muted-foreground">{t('cart.checking')}</p>}
        {blocked ? (
          <Button size="lg" disabled className="mt-4 w-full">
            {t('cart.checkout')}
          </Button>
        ) : (
          <Link href="/checkout" className={buttonVariants({ size: 'lg', className: 'mt-4 w-full' })}>
            {t('cart.checkout')}
          </Link>
        )}
        <div className="mt-3 flex items-center justify-between">
          <Link href="/listings" className="text-sm text-muted-foreground hover:text-foreground">
            {t('cart.continue')}
          </Link>
          <button type="button" onClick={clear} className="text-sm text-muted-foreground hover:text-destructive">
            {t('cart.clear')}
          </button>
        </div>
      </aside>
    </div>
  )
}
