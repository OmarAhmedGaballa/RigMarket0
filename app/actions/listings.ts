'use server'

import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { listings } from '@/lib/db/schema'
import { getCurrentUser } from '@/lib/session'
import { getSellerProfile } from '@/lib/queries'
import { CATEGORIES, CONDITIONS } from '@/lib/categories'
import { MAX_PRICE, MAX_STOCK } from '@/lib/config'
import { getI18n } from '@/lib/i18n/server'
import { deleteImage, hasFile, imageIdFromUrl, imageUrlFor, saveImage } from '@/lib/uploads'
import { parseIntInRange, text } from '@/lib/validation'

export type FormState = { error?: string; success?: string } | undefined

async function getUserOrThrow() {
  const user = await getCurrentUser()
  if (!user) throw new Error('Unauthorized')
  return user
}

async function getAdminOrThrow() {
  const user = await getUserOrThrow()
  if (user.role !== 'admin') throw new Error('Forbidden')
  return user
}

function revalidateAll() {
  revalidatePath('/', 'layout')
}

/** Fields shared by the seller form and the admin edit form. */
async function readListingFields(formData: FormData, opts: { minStock: number }) {
  const { t } = await getI18n()
  const title = text(formData, 'title', 120)
  const description = text(formData, 'description', 3000)
  const category = text(formData, 'category', 60)
  const brand = text(formData, 'brand', 60)
  const condition = text(formData, 'condition', 20)
  const location = text(formData, 'location', 80)
  const price = parseIntInRange(formData.get('price'), 1, MAX_PRICE)
  const stock = parseIntInRange(formData.get('stock'), opts.minStock, MAX_STOCK)

  let error: string | null = null
  if (title.length < 4) error = t('err.title')
  else if (description.length < 10) error = t('err.desc')
  else if (!CATEGORIES.some((c) => c.slug === category)) error = t('err.category')
  else if (!CONDITIONS.some((c) => c.value === condition)) error = t('err.condition')
  else if (price === null) error = t('err.price', { max: MAX_PRICE })
  else if (stock === null) error = t('err.stock', { max: MAX_STOCK })

  return {
    error,
    t,
    values: { title, description, category, brand: brand || null, condition, location: location || null, price: price ?? 0, stock: stock ?? 0 },
  }
}

export async function createListing(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser()
  const { t } = await getI18n()
  if (!user) return { error: t('err.signIn') }

  const isAdmin = user.role === 'admin'
  if (!isAdmin) {
    const profile = await getSellerProfile(user.id)
    if (!profile.phone || !profile.idImageId) return { error: t('err.verifyFirst') }
  }

  const { error, values } = await readListingFields(formData, { minStock: 1 })
  if (error) return { error }

  const photo = formData.get('photo')
  if (!hasFile(photo)) return { error: t('err.photoRequired') }
  const saved = await saveImage(photo, { userId: user.id, kind: 'listing' })
  if (!saved.ok) return { error: t(`err.${saved.error}`) }

  await db.insert(listings).values({
    userId: user.id,
    ...values,
    imageUrl: imageUrlFor(saved.id),
    // Admins publish their own ads directly.
    status: isAdmin ? 'approved' : 'pending',
    reviewedAt: isAdmin ? new Date() : null,
  })

  revalidateAll()
  redirect(isAdmin ? '/admin?tab=approved' : '/dashboard?submitted=1')
}

export async function acceptRecommendedPrice(id: number) {
  const user = await getUserOrThrow()
  const [listing] = await db
    .select()
    .from(listings)
    .where(and(eq(listings.id, id), eq(listings.userId, user.id)))
  if (!listing || listing.status !== 'declined' || !listing.recommendedPrice) return

  await db
    .update(listings)
    .set({ price: listing.recommendedPrice, status: 'pending', updatedAt: new Date() })
    .where(and(eq(listings.id, id), eq(listings.userId, user.id)))
  revalidateAll()
}

export async function resubmitWithPrice(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getUserOrThrow()
  const { t } = await getI18n()
  const id = Number(formData.get('id'))
  const price = parseIntInRange(formData.get('price'), 1, MAX_PRICE)
  if (!Number.isInteger(id)) return { error: t('err.invalid') }
  if (price === null) return { error: t('err.price', { max: MAX_PRICE }) }

  const result = await db
    .update(listings)
    .set({ price, status: 'pending', updatedAt: new Date() })
    .where(and(eq(listings.id, id), eq(listings.userId, user.id), eq(listings.status, 'declined')))
    .returning({ id: listings.id })
  if (result.length === 0) return { error: t('err.resubmit') }

  revalidateAll()
  return { success: t('ok.resubmitted') }
}

export async function deleteListing(id: number) {
  const user = await getUserOrThrow()
  const [row] = await db
    .delete(listings)
    .where(and(eq(listings.id, id), eq(listings.userId, user.id)))
    .returning({ imageUrl: listings.imageUrl })
  await deleteImage(imageIdFromUrl(row?.imageUrl))
  revalidateAll()
}

// --- admin: full control over every ad --------------------------------------

export async function approveListing(id: number) {
  await getAdminOrThrow()
  await db
    .update(listings)
    .set({ status: 'approved', adminNote: null, recommendedPrice: null, reviewedAt: new Date(), updatedAt: new Date() })
    .where(eq(listings.id, id))
  revalidateAll()
}

export async function declineListing(_prev: FormState, formData: FormData): Promise<FormState> {
  await getAdminOrThrow()
  const { t } = await getI18n()
  const id = Number(formData.get('id'))
  if (!Number.isInteger(id)) return { error: t('err.invalid') }

  const rawRecommended = formData.get('recommendedPrice')
  const hasRecommended = typeof rawRecommended === 'string' && rawRecommended.trim() !== ''
  const recommendedPrice = hasRecommended ? parseIntInRange(rawRecommended, 1, MAX_PRICE) : null
  if (hasRecommended && recommendedPrice === null) return { error: t('err.recPrice') }
  const adminNote = text(formData, 'adminNote', 500)

  await db
    .update(listings)
    .set({
      status: 'declined',
      recommendedPrice,
      adminNote: adminNote || null,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(listings.id, id))

  revalidateAll()
  return { success: t('ok.declined') }
}

export async function adminDeleteListing(id: number) {
  await getAdminOrThrow()
  const [row] = await db.delete(listings).where(eq(listings.id, id)).returning({ imageUrl: listings.imageUrl })
  await deleteImage(imageIdFromUrl(row?.imageUrl))
  revalidateAll()
}

export async function adminUpdateListing(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await getAdminOrThrow()
  const { t } = await getI18n()
  const id = Number(formData.get('id'))
  if (!Number.isInteger(id)) return { error: t('err.invalid') }

  const [existing] = await db.select().from(listings).where(eq(listings.id, id))
  if (!existing) return { error: t('err.invalid') }

  // Admins may set stock to 0 (sold out).
  const { error, values } = await readListingFields(formData, { minStock: 0 })
  if (error) return { error }

  const status = text(formData, 'status', 20)
  if (!['pending', 'approved', 'declined'].includes(status)) return { error: t('err.invalid') }
  const adminNote = text(formData, 'adminNote', 500)

  let imageUrl = existing.imageUrl
  let oldImageToDelete: string | null = null
  const photo = formData.get('photo')
  if (hasFile(photo)) {
    const saved = await saveImage(photo, { userId: admin.id, kind: 'listing' })
    if (!saved.ok) return { error: t(`err.${saved.error}`) }
    oldImageToDelete = imageIdFromUrl(existing.imageUrl)
    imageUrl = imageUrlFor(saved.id)
  } else if (formData.get('removePhoto') === 'on') {
    oldImageToDelete = imageIdFromUrl(existing.imageUrl)
    imageUrl = null
  }

  await db
    .update(listings)
    .set({
      ...values,
      imageUrl,
      status,
      adminNote: adminNote || null,
      reviewedAt: status !== existing.status ? new Date() : existing.reviewedAt,
      updatedAt: new Date(),
    })
    .where(eq(listings.id, id))
  await deleteImage(oldImageToDelete)

  revalidateAll()
  return { success: t('admin.edit.saved') }
}
