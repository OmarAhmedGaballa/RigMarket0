import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, MapPin, PackageCheck, User } from 'lucide-react'
import { getListingWithSeller } from '@/lib/queries'
import { getCurrentUser } from '@/lib/session'
import { categoryName, conditionLabel, getCategory } from '@/lib/categories'
import { formatPrice } from '@/lib/i18n'
import { getI18n } from '@/lib/i18n/server'
import { resolveImage } from '@/lib/listing-image'
import { ListingImage } from '@/components/listing-image'
import { StatusBadge } from '@/components/status-badge'
import { AddToCartButton } from '@/components/add-to-cart-button'
import { buttonVariants } from '@/components/ui/button'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const numericId = Number(id)
  if (!Number.isInteger(numericId)) return {}
  const row = await getListingWithSeller(numericId)
  return row && row.listing.status === 'approved' ? { title: `${row.listing.title} — RigMarket` } : {}
}

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const numericId = Number(id)
  if (!Number.isInteger(numericId)) notFound()

  const [row, viewer, { t, locale }] = await Promise.all([getListingWithSeller(numericId), getCurrentUser(), getI18n()])
  if (!row) notFound()
  const { listing, sellerName } = row

  const canSeeUnpublished = viewer && (viewer.role === 'admin' || viewer.id === listing.userId)
  if (listing.status !== 'approved' && !canSeeUnpublished) notFound()

  const category = getCategory(listing.category)
  const purchasable = listing.status === 'approved'
  const soldOut = listing.stock <= 0
  const cartItem = {
    id: listing.id,
    title: listing.title,
    price: listing.price,
    stock: listing.stock,
    image: resolveImage(listing),
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
      <Link
        href={category ? `/listings?category=${category.slug}` : '/listings'}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4 rtl:rotate-180" aria-hidden="true" />
        {category ? categoryName(category, locale) : t('listings.allListings')}
      </Link>

      <div className="mt-6 grid gap-8 md:grid-cols-2">
        <div className="overflow-hidden rounded-xl border bg-muted">
          <ListingImage listing={listing} className="aspect-square size-full object-cover" />
        </div>

        <div className="flex flex-col gap-5">
          {listing.status !== 'approved' && (
            <div className="flex items-center gap-2">
              <StatusBadge status={listing.status} />
              <span className="text-xs text-muted-foreground">{t('detail.onlyYou')}</span>
            </div>
          )}
          <div>
            <p className="text-sm text-muted-foreground">
              {[listing.brand, conditionLabel(listing.condition, locale)].filter(Boolean).join(' · ')}
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-balance">{listing.title}</h1>
          </div>
          <p className="font-mono text-3xl font-semibold text-primary">{formatPrice(listing.price, locale)}</p>

          {purchasable && (
            <div className="flex flex-col gap-3">
              <p className={soldOut ? 'text-sm font-medium text-destructive' : 'text-sm text-success'}>
                {soldOut ? t('detail.soldOut') : t('detail.inStock', { n: listing.stock })}
              </p>
              <div className="flex flex-wrap gap-3">
                <AddToCartButton item={cartItem} buyNow size="lg" />
                <AddToCartButton item={cartItem} size="lg" />
              </div>
            </div>
          )}

          <div className="flex items-start gap-3 rounded-xl border bg-card p-4">
            <PackageCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
            <div className="text-sm">
              <p className="font-medium">{t('detail.storeNote.title')}</p>
              <p className="text-muted-foreground">{t('detail.storeNote.text')}</p>
            </div>
          </div>

          {/* The seller's phone number is deliberately not part of this page's data. */}
          <dl className="grid gap-3 rounded-xl border bg-card p-4 text-sm">
            <div className="flex items-center gap-2">
              <User className="size-4 text-muted-foreground" aria-hidden="true" />
              <dt className="sr-only">{t('detail.seller')}</dt>
              <dd>{sellerName ?? t('detail.seller')}</dd>
            </div>
            {listing.location && (
              <div className="flex items-center gap-2">
                <MapPin className="size-4 text-muted-foreground" aria-hidden="true" />
                <dt className="sr-only">{t('detail.location')}</dt>
                <dd>{listing.location}</dd>
              </div>
            )}
          </dl>

          <div>
            <h2 className="font-medium">{t('detail.description')}</h2>
            <p className="mt-2 leading-relaxed whitespace-pre-line text-muted-foreground">{listing.description}</p>
          </div>

          {canSeeUnpublished && viewer?.role === 'admin' && (
            <Link href={`/admin/listings/${listing.id}/edit`} className={buttonVariants({ variant: 'outline', className: 'self-start' })}>
              {t('admin.edit')}
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
