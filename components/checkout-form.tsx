'use client'

import Link from 'next/link'
import { useState } from 'react'
import { placeOrder } from '@/app/actions/orders'
import type { PaymentMethod } from '@/lib/db/schema'
import { useFormAction } from '@/lib/use-form-action'
import { useCart } from '@/components/cart-provider'
import { useCartSync } from '@/components/use-cart-sync'
import { useI18n } from '@/components/i18n-provider'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

export function CheckoutForm({ methods, defaultName }: { methods: PaymentMethod[]; defaultName: string }) {
  const { lines, hydrated, total } = useCart()
  useCartSync()
  const { t, locale, price } = useI18n()
  const { state, onSubmit, pending } = useFormAction(placeOrder)
  const [selected, setSelected] = useState(methods[0]?.code ?? '')
  const method = methods.find((m) => m.code === selected)

  if (!hydrated) return <div className="mt-8 h-40 animate-pulse rounded-xl bg-muted" aria-hidden="true" />

  if (lines.length === 0) {
    return (
      <div className="mt-8 rounded-xl border border-dashed p-10 text-center">
        <p className="text-muted-foreground">{t('checkout.empty')}</p>
        <Link href="/listings" className={buttonVariants({ className: 'mt-4' })}>
          {t('cart.continue')}
        </Link>
      </div>
    )
  }

  const blocked = lines.some((l) => l.stock <= 0)
  const cartPayload = JSON.stringify(lines.map((l) => ({ id: l.id, qty: l.qty })))

  return (
    <form onSubmit={onSubmit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
      <input type="hidden" name="cart" value={cartPayload} />

      <div className="flex flex-col gap-8">
        <section className="flex flex-col gap-4" aria-labelledby="delivery-heading">
          <h2 id="delivery-heading" className="font-medium">
            {t('checkout.delivery')}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="fullName">{t('checkout.fullName')}</Label>
              <Input id="fullName" name="fullName" required maxLength={100} defaultValue={defaultName} autoComplete="name" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">{t('checkout.phone')}</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                inputMode="tel"
                dir="ltr"
                required
                maxLength={30}
                autoComplete="tel"
                placeholder="01XXXXXXXXX"
                className="text-start"
              />
              <p className="text-xs text-muted-foreground">{t('checkout.phoneHint')}</p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:max-w-xs">
            <Label htmlFor="city">{t('checkout.city')}</Label>
            <Input id="city" name="city" required maxLength={80} autoComplete="address-level2" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="address">{t('checkout.address')}</Label>
            <Textarea id="address" name="address" required minLength={5} maxLength={300} rows={2} autoComplete="street-address" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">
              {t('checkout.notes')} ({t('common.optional')})
            </Label>
            <Textarea id="notes" name="notes" maxLength={500} rows={2} placeholder={t('checkout.notesPlaceholder')} />
          </div>
        </section>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 font-medium">{t('checkout.payment')}</legend>
          {methods.length === 0 && (
            <p role="alert" className="rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-sm">
              {t('checkout.noMethods')}
            </p>
          )}
          {methods.map((m) => {
            const active = m.code === selected
            const instructions = locale === 'ar' ? m.instructionsAr : m.instructionsEn
            return (
              <label
                key={m.code}
                className={cn(
                  'flex cursor-pointer flex-col gap-2 rounded-xl border bg-card p-4 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring',
                  active && 'border-primary bg-primary/5',
                )}
              >
                <span className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={m.code}
                    checked={active}
                    onChange={() => setSelected(m.code)}
                    className="size-4 accent-[var(--primary)]"
                  />
                  <span className="font-medium">{locale === 'ar' ? m.nameAr : m.nameEn}</span>
                </span>
                {active && (
                  <span className="flex flex-col gap-2 ps-7 text-sm">
                    {instructions && <span className="text-muted-foreground">{instructions}</span>}
                    {m.accountDetails && (
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-muted-foreground">{t('checkout.payTo')}</span>
                        <bdi dir="ltr" className="rounded-md bg-muted px-2 py-1 font-mono text-sm select-all">
                          {m.accountDetails}
                        </bdi>
                      </span>
                    )}
                  </span>
                )}
              </label>
            )
          })}
          {method?.requiresReference && (
            <div className="flex flex-col gap-2 sm:max-w-sm">
              <Label htmlFor="paymentReference">{t('checkout.reference')}</Label>
              <Input
                id="paymentReference"
                name="paymentReference"
                required
                maxLength={80}
                dir="ltr"
                placeholder={t('checkout.referencePlaceholder')}
                className="text-start"
              />
            </div>
          )}
        </fieldset>
      </div>

      <aside className="h-fit rounded-xl border bg-card p-5 lg:sticky lg:top-24">
        <h2 className="font-medium">{t('checkout.summary')}</h2>
        <ul className="mt-3 flex flex-col gap-3">
          {lines.map((l) => (
            <li key={l.id} className="flex items-start justify-between gap-3 text-sm">
              <span className="min-w-0">
                <span className="line-clamp-2">{l.title}</span>
                <span className="text-xs text-muted-foreground">{t('orders.qty', { n: l.qty })}</span>
              </span>
              <span className="shrink-0 font-mono">{price(l.price * l.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-baseline justify-between border-t pt-4">
          <span className="font-medium">{t('cart.total')}</span>
          <span className="font-mono text-xl font-semibold text-primary">{price(total)}</span>
        </div>

        {blocked && (
          <p role="alert" className="mt-3 text-sm text-destructive">
            {t('cart.unavailable')}
          </p>
        )}
        {state?.error && (
          <p role="alert" className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {state.error}
          </p>
        )}
        <Button type="submit" size="lg" disabled={pending || blocked || methods.length === 0} className="mt-4 w-full">
          {pending ? t('checkout.placing') : t('checkout.place')}
        </Button>
      </aside>
    </form>
  )
}
