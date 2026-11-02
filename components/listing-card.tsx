import Link from 'next/link'
import { MapPin } from 'lucide-react'
import type { PublicListing } from '@/lib/db/schema'
import { categoryName, conditionLabel, getCategory } from '@/lib/categories'
import { formatPrice } from '@/lib/i18n'
import { getI18n } from '@/lib/i18n/server'
import { resolveImage } from '@/lib/listing-image'
import { ListingImage } from '@/components/listing-image'
import { AddToCartButton } from '@/components/add-to-cart-button'

export async function ListingCard({ listing }: { listing: PublicListing }) {
  const { t, locale } = await getI18n()
  const category = getCategory(listing.category)
  const soldOut = listing.stock <= 0

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border bg-card transition-colors focus-within:border-primary/50 hover:border-primary/50">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <ListingImage
          listing={listing}
          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {soldOut && (
          <span className="absolute start-2 top-2 rounded-full bg-background/90 px-2 py-0.5 text-xs font-medium">
            {t('listing.soldOut')}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs text-muted-foreground">
          {categoryName(category, locale, listing.category)} · {conditionLabel(listing.condition, locale)}
        </p>
        <h3 className="line-clamp-2 leading-snug font-medium text-pretty">
          {/* Stretched link: the whole card opens the ad, the cart button sits above it. */}
          <Link href={`/listings/${listing.id}`} className="outline-none after:absolute after:inset-0 after:z-0 focus-visible:after:ring-2 focus-visible:after:ring-ring">
            {listing.title}
          </Link>
        </h3>
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <span className="font-mono text-lg font-semibold text-primary">{formatPrice(listing.price, locale)}</span>
          {listing.location && (
            <span className="flex items-center gap-1 truncate text-xs text-muted-foreground">
              <MapPin className="size-3" aria-hidden="true" />
              {listing.location}
            </span>
          )}
        </div>
        <AddToCartButton
          size="sm"
          className="relative z-10 mt-1 w-full"
          item={{
            id: listing.id,
            title: listing.title,
            price: listing.price,
            stock: listing.stock,
            image: resolveImage(listing),
          }}
        />
      </div>
    </article>
  )
}
