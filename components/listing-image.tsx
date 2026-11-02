import type { PublicListing } from '@/lib/db/schema'
import { resolveImage } from '@/lib/listing-image'

export function ListingImage({ listing, className }: { listing: PublicListing; className?: string }) {
  // Uploaded photos are served from /api/images; older ads may still hold an external https URL.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={resolveImage(listing)} alt={listing.title} className={className} loading="lazy" />
}
