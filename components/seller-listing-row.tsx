'use client'

import Link from 'next/link'
import { useActionState, useTransition } from 'react'
import { Lightbulb, Trash2 } from 'lucide-react'
import { MAX_STOCK } from '@/lib/config'
import type { SellerListing } from '@/lib/db/schema'
import { acceptRecommendedPrice, deleteListing, removeDiscount, resubmitWithPrice, setDiscount, updateStock } from '@/app/actions/listings'
import { categoryName, getCategory } from '@/lib/categories'
import { CURRENCY } from '@/lib/config'
import { useI18n } from '@/components/i18n-provider'
import { StatusBadge } from '@/components/status-badge'
import { ListingImageClient } from '@/components/listing-image-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function SellerListingRow({ listing }: { listing: SellerListing }) {
  const { t, locale, price } = useI18n()
  const [pending, startTransition] = useTransition()
  const [state, resubmit, resubmitting] = useActionState(resubmitWithPrice, undefined)
  const category = getCategory(listing.category)

  return (
    <article className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:flex-row">
      <ListingImageClient listing={listing} className="size-24 shrink-0 rounded-lg object-cover" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={listing.status} />
          <span className="text-xs text-muted-foreground">{categoryName(category, locale)}</span>
          {listing.stock <= 0 ? (
            <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">{t('listing.soldOut')}</span>
          ) : (
            <span className="text-xs text-muted-foreground">· {t('dash.stock', { n: listing.stock })}</span>
          )}
        </div>
        <Link href={`/listings/${listing.id}`} className="font-medium hover:text-primary">
          {listing.title}
        </Link>
        <p className="font-mono text-sm">
          {t('dash.yourPrice')} <span className="font-semibold">{price(listing.sellerPrice ?? listing.price)}</span>
          {listing.originalSellerPrice !== null && (
            <>
              {' '}
              <span className="text-xs text-muted-foreground line-through">{price(listing.originalSellerPrice)}</span>
              <span className="ms-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{t('dash.onSale')}</span>
            </>
          )}
        </p>
        {listing.status === 'approved' && listing.sellerPrice !== null && listing.price !== listing.sellerPrice && (
          <p className="text-xs text-muted-foreground">
            {t('dash.publicPrice', { price: price(listing.price) })}
          </p>
        )}

        <StockPanel listing={listing} />
        {listing.status === 'approved' && <DiscountPanel listing={listing} />}

        {listing.status === 'declined' && (
          <div className="mt-2 flex flex-col gap-3 rounded-lg border border-destructive/25 bg-destructive/5 p-3">
            {listing.adminNote && (
              <p className="text-sm">
                <span className="font-medium">{t('dash.adminNote')} </span>
                <span className="text-muted-foreground">{listing.adminNote}</span>
              </p>
            )}
            {listing.recommendedPrice ? (
              <div className="flex flex-wrap items-center gap-3">
                <p className="flex items-center gap-2 text-sm">
                  <Lightbulb className="size-4 text-warning" aria-hidden="true" />
                  {t('dash.recommended')}
                  <span className="font-mono font-semibold text-primary">{price(listing.recommendedPrice)}</span>
                </p>
                <Button
                  size="sm"
                  disabled={pending}
                  onClick={() => startTransition(() => acceptRecommendedPrice(listing.id))}
                >
                  {t('dash.accept')}
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t('dash.noRec')}</p>
            )}
            <form action={resubmit} className="flex flex-wrap items-end gap-2">
              <input type="hidden" name="id" value={listing.id} />
              <div className="flex flex-col gap-1">
                <Label htmlFor={`price-${listing.id}`} className="text-xs text-muted-foreground">
                  {t('dash.orSet')} ({CURRENCY})
                </Label>
                <Input
                  id={`price-${listing.id}`}
                  name="price"
                  type="number"
                  min={1}
                  step={1}
                  required
                  defaultValue={listing.recommendedPrice ?? listing.sellerPrice ?? listing.price}
                  className="w-32"
                />
              </div>
              <Button type="submit" size="sm" variant="outline" disabled={resubmitting}>
                {t('dash.resubmit')}
              </Button>
              {state?.error && (
                <p role="alert" className="w-full text-xs text-destructive">
                  {state.error}
                </p>
              )}
            </form>
          </div>
        )}
      </div>
      <Button
        variant="outline"
        size="sm"
        aria-label={t('dash.deleteAria', { title: listing.title })}
        disabled={pending}
        className="self-start text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={() => {
          if (confirm(t('dash.deleteConfirm'))) startTransition(() => deleteListing(listing.id))
        }}
      >
        <Trash2 aria-hidden="true" />
        {t('dash.delete')}
      </Button>
    </article>
  )
}

/** Seller: change the quantity in stock, or mark the ad as sold out (stock 0). */
function StockPanel({ listing }: { listing: SellerListing }) {
  const { t } = useI18n()
  const [state, save, saving] = useActionState(updateStock, undefined)
  const [soldState, markSold, markingSold] = useActionState(updateStock, undefined)

  return (
    <div className="mt-1 flex flex-wrap items-end gap-x-4 gap-y-2 rounded-lg border bg-muted/40 p-3">
      <form action={save} className="flex flex-wrap items-end gap-2">
        <input type="hidden" name="id" value={listing.id} />
        <div className="flex flex-col gap-1">
          <Label htmlFor={`stock-${listing.id}`} className="text-xs text-muted-foreground">
            {t('dash.qty')}
          </Label>
          <Input
            id={`stock-${listing.id}`}
            name="stock"
            type="number"
            min={0}
            max={MAX_STOCK}
            step={1}
            required
            // key makes the field follow the saved value (e.g. after "Mark sold out").
            key={listing.stock}
            defaultValue={listing.stock}
            className="w-24"
          />
        </div>
        <Button type="submit" size="sm" variant="outline" disabled={saving}>
          {t('dash.saveQty')}
        </Button>
      </form>
      {listing.stock > 0 && (
        <form action={markSold}>
          <input type="hidden" name="id" value={listing.id} />
          <input type="hidden" name="stock" value="0" />
          <Button type="submit" size="sm" variant="outline" disabled={markingSold}>
            {t('dash.markSold')}
          </Button>
        </form>
      )}
      {(state?.error || soldState?.error) && (
        <p role="alert" className="w-full text-xs text-destructive">{state?.error ?? soldState?.error}</p>
      )}
      {(state?.success || soldState?.success) && (
        <p role="status" className="w-full text-xs text-success">{soldState?.success ?? state?.success}</p>
      )}
    </div>
  )
}

/** Seller: lower the price of a live ad. The price can only go down; raising it is rejected by the server. */
function DiscountPanel({ listing }: { listing: SellerListing }) {
  const { t, price } = useI18n()
  const [state, save, saving] = useActionState(setDiscount, undefined)
  const [pending, startTransition] = useTransition()
  const current = listing.sellerPrice ?? listing.price

  return (
    <div className="flex flex-wrap items-end gap-x-4 gap-y-2 rounded-lg border bg-muted/40 p-3">
      <form action={save} className="flex flex-wrap items-end gap-2">
        <input type="hidden" name="id" value={listing.id} />
        <div className="flex flex-col gap-1">
          <Label htmlFor={`disc-${listing.id}`} className="text-xs text-muted-foreground">
            {t('dash.discountLabel', { price: price(current) })}
          </Label>
          <Input
            id={`disc-${listing.id}`}
            name="price"
            type="number"
            min={1}
            max={current - 1}
            step={1}
            required
            placeholder={String(Math.max(1, current - 1))}
            key={current}
            className="w-32"
          />
        </div>
        <Button type="submit" size="sm" variant="outline" disabled={saving || current <= 1}>
          {t('dash.applyDiscount')}
        </Button>
      </form>
      {listing.originalSellerPrice !== null && (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={pending}
          onClick={() => startTransition(() => removeDiscount(listing.id))}
        >
          {t('dash.endDiscount', { price: price(listing.originalSellerPrice) })}
        </Button>
      )}
      <p className="w-full text-xs text-muted-foreground">{t('dash.discountHint')}</p>
      {state?.error && <p role="alert" className="w-full text-xs text-destructive">{state.error}</p>}
      {state?.success && <p role="status" className="w-full text-xs text-success">{state.success}</p>}
    </div>
  )
}
