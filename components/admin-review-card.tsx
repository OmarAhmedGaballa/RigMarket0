'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { Check, IdCard, Pencil, Phone, Trash2, X } from 'lucide-react'
import type { Listing } from '@/lib/db/schema'
import { adminDeleteListing, approveListing, declineListing } from '@/app/actions/listings'
import { categoryName, conditionLabel, getCategory } from '@/lib/categories'
import { CURRENCY } from '@/lib/config'
import { useFormAction } from '@/lib/use-form-action'
import { useI18n } from '@/components/i18n-provider'
import { StatusBadge } from '@/components/status-badge'
import { ListingImageClient } from '@/components/listing-image-client'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type Props = {
  listing: Listing
  sellerName: string | null
  sellerEmail: string | null
  sellerPhone: string | null
  sellerIdImageId: string | null
}

export function AdminReviewCard({ listing, sellerName, sellerEmail, sellerPhone, sellerIdImageId }: Props) {
  const { t, locale, price } = useI18n()
  const [declining, setDeclining] = useState(false)
  const [busy, startTransition] = useTransition()
  const { state, onSubmit, pending } = useFormAction(declineListing)
  const category = getCategory(listing.category)

  return (
    <article className="flex flex-col gap-4 rounded-xl border bg-card p-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <ListingImageClient listing={listing} className="size-28 shrink-0 rounded-lg object-cover" />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={listing.status} />
            <span className="text-xs text-muted-foreground">
              {categoryName(category, locale)} · {conditionLabel(listing.condition, locale)}
              {listing.brand ? ` · ${listing.brand}` : ''} · {t('admin.stock', { n: listing.stock })}
            </span>
          </div>
          <Link href={`/listings/${listing.id}`} className="font-medium hover:text-primary">
            {listing.title}
          </Link>
          <p className="line-clamp-2 text-sm text-muted-foreground">{listing.description}</p>
        </div>
        <div className="flex flex-row items-center justify-between gap-2 sm:flex-col sm:items-end">
          <p className="font-mono text-xl font-semibold text-primary">{price(listing.price)}</p>
          {listing.status === 'declined' && listing.recommendedPrice && (
            <p className="font-mono text-xs text-muted-foreground">
              {t('admin.suggested', { price: price(listing.recommendedPrice) })}
            </p>
          )}
        </div>
      </div>

      {/* Private seller details: this card is only ever rendered on admin pages. */}
      <div className="grid gap-3 rounded-lg bg-muted/60 p-3 text-sm sm:grid-cols-[1fr_1fr_auto]">
        <div>
          <p className="text-xs text-muted-foreground">{t('admin.seller')}</p>
          <p className="font-medium">{sellerName ?? '—'}</p>
          {sellerEmail && <p className="text-xs text-muted-foreground">{sellerEmail}</p>}
        </div>
        <div>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <Phone className="size-3" aria-hidden="true" />
            {t('admin.sellerPhone')}
          </p>
          {sellerPhone || listing.contactPhone ? (
            <bdi dir="ltr" className="font-mono font-medium select-all">
              {sellerPhone ?? listing.contactPhone}
            </bdi>
          ) : (
            <p className="text-muted-foreground">{t('admin.noPhone')}</p>
          )}
        </div>
        <div>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <IdCard className="size-3" aria-hidden="true" />
            {t('admin.sellerId')}
          </p>
          {sellerIdImageId ? (
            <a
              href={`/api/images/${sellerIdImageId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              {t('admin.viewId')}
            </a>
          ) : (
            <p className="text-muted-foreground">{t('admin.noId')}</p>
          )}
        </div>
      </div>

      {listing.status === 'declined' && listing.adminNote && (
        <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
          {t('admin.note')} {listing.adminNote}
        </p>
      )}

      {!declining && (
        <div className="flex flex-wrap gap-2 border-t pt-4">
          {listing.status !== 'approved' && (
            <Button disabled={busy} onClick={() => startTransition(() => approveListing(listing.id))}>
              <Check aria-hidden="true" />
              {busy ? t('admin.approving') : t('admin.approve')}
            </Button>
          )}
          {listing.status === 'pending' && (
            <Button variant="destructive" onClick={() => setDeclining(true)}>
              <X aria-hidden="true" />
              {t('admin.decline')}
            </Button>
          )}
          {listing.status === 'approved' && (
            <Button variant="destructive" onClick={() => setDeclining(true)}>
              <X aria-hidden="true" />
              {t('admin.takeDown')}
            </Button>
          )}
          <Link href={`/admin/listings/${listing.id}/edit`} className={buttonVariants({ variant: 'outline' })}>
            <Pencil aria-hidden="true" />
            {t('admin.edit')}
          </Link>
          <Button
            variant="ghost"
            disabled={busy}
            className="text-muted-foreground hover:text-destructive sm:ms-auto"
            onClick={() => {
              if (confirm(t('admin.deleteConfirm'))) startTransition(() => adminDeleteListing(listing.id))
            }}
          >
            <Trash2 aria-hidden="true" />
            {t('admin.delete')}
          </Button>
        </div>
      )}

      {declining && (
        <form onSubmit={onSubmit} className="flex flex-col gap-3 border-t pt-4">
          <input type="hidden" name="id" value={listing.id} />
          <div className="grid gap-3 sm:grid-cols-[200px_1fr]">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`rec-${listing.id}`}>{t('admin.recPrice', { currency: CURRENCY })}</Label>
              <Input
                id={`rec-${listing.id}`}
                name="recommendedPrice"
                type="number"
                min={1}
                step={1}
                placeholder={String(listing.price)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`note-${listing.id}`}>{t('admin.reason')}</Label>
              <Textarea
                id={`note-${listing.id}`}
                name="adminNote"
                rows={2}
                maxLength={500}
                placeholder={t('admin.reasonPh')}
              />
            </div>
          </div>
          {state?.error && (
            <p role="alert" className="text-sm text-destructive">
              {state.error}
            </p>
          )}
          <div className="flex gap-2">
            <Button type="submit" variant="destructive" disabled={pending}>
              {pending ? t('admin.declining') : t('admin.confirmDecline')}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setDeclining(false)}>
              {t('common.cancel')}
            </Button>
          </div>
        </form>
      )}
    </article>
  )
}
