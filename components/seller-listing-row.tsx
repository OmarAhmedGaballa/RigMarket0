'use client'

import Link from 'next/link'
import { useActionState, useTransition } from 'react'
import { Lightbulb, Trash2 } from 'lucide-react'
import type { PublicListing } from '@/lib/db/schema'
import { acceptRecommendedPrice, deleteListing, resubmitWithPrice } from '@/app/actions/listings'
import { categoryName, getCategory } from '@/lib/categories'
import { CURRENCY } from '@/lib/config'
import { useI18n } from '@/components/i18n-provider'
import { StatusBadge } from '@/components/status-badge'
import { ListingImageClient } from '@/components/listing-image-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function SellerListingRow({ listing }: { listing: PublicListing }) {
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
          <span className="text-xs text-muted-foreground">· {t('dash.stock', { n: listing.stock })}</span>
        </div>
        <Link href={`/listings/${listing.id}`} className="font-medium hover:text-primary">
          {listing.title}
        </Link>
        <p className="font-mono text-sm">
          {t('dash.yourPrice')} <span className="font-semibold">{price(listing.price)}</span>
        </p>

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
                  defaultValue={listing.recommendedPrice ?? listing.price}
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
        variant="ghost"
        size="icon"
        aria-label={t('dash.deleteAria', { title: listing.title })}
        disabled={pending}
        className="self-start text-muted-foreground hover:text-destructive"
        onClick={() => {
          if (confirm(t('dash.deleteConfirm'))) startTransition(() => deleteListing(listing.id))
        }}
      >
        <Trash2 aria-hidden="true" />
      </Button>
    </article>
  )
}
