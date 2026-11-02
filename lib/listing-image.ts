import { getCategory } from '@/lib/categories'

export const FALLBACK_IMAGE = '/images/cat-parts.png'

export function resolveImage(listing: { imageUrl: string | null; category: string }) {
  return listing.imageUrl || getCategory(listing.category)?.image || FALLBACK_IMAGE
}
