import 'server-only'
import { and, asc, desc, eq, ilike, inArray, or, sql, getTableColumns } from 'drizzle-orm'
import { db } from '@/lib/db'
import { images, listings, orderItems, orders, paymentMethods, user } from '@/lib/db/schema'

// Buyers must never receive a seller's phone number, so public queries leave it out.
const { contactPhone: _hidden, ...publicColumns } = getTableColumns(listings)

export async function getApprovedListings(opts: { category?: string; q?: string; limit?: number } = {}) {
  const filters = [eq(listings.status, 'approved')]
  if (opts.category) filters.push(eq(listings.category, opts.category))
  if (opts.q) {
    const pattern = `%${opts.q.replace(/[%_\\]/g, '\\$&')}%`
    filters.push(or(ilike(listings.title, pattern), ilike(listings.brand, pattern))!)
  }
  return db
    .select(publicColumns)
    .from(listings)
    .where(and(...filters))
    .orderBy(desc(listings.reviewedAt))
    .limit(opts.limit ?? 60)
}

export async function getApprovedCountsByCategory() {
  const rows = await db
    .select({ category: listings.category, count: sql<number>`count(*)::int` })
    .from(listings)
    .where(eq(listings.status, 'approved'))
    .groupBy(listings.category)
  return Object.fromEntries(rows.map((r) => [r.category, r.count])) as Record<string, number>
}

export async function getListingWithSeller(id: number) {
  const [row] = await db
    .select({ listing: publicColumns, sellerName: user.name })
    .from(listings)
    .leftJoin(user, eq(user.id, listings.userId))
    .where(eq(listings.id, id))
  return row ?? null
}

/** Admin-only: full listing row (includes the legacy contactPhone). */
export async function getListingForAdmin(id: number) {
  const [row] = await db.select().from(listings).where(eq(listings.id, id))
  return row ?? null
}

export async function getListingsForUser(userId: string) {
  return db
    .select(publicColumns)
    .from(listings)
    .where(eq(listings.userId, userId))
    .orderBy(desc(listings.updatedAt))
}

export async function getListingsForAdmin(status: 'pending' | 'approved' | 'declined') {
  return db
    .select({
      listing: listings,
      sellerName: user.name,
      sellerEmail: user.email,
      sellerPhone: user.phone,
      sellerIdImageId: user.idImageId,
    })
    .from(listings)
    .leftJoin(user, eq(user.id, listings.userId))
    .where(eq(listings.status, status))
    .orderBy(status === 'pending' ? listings.updatedAt : desc(listings.reviewedAt))
}

export async function getStatusCounts() {
  const rows = await db
    .select({ status: listings.status, count: sql<number>`count(*)::int` })
    .from(listings)
    .groupBy(listings.status)
  const counts = { pending: 0, approved: 0, declined: 0 }
  for (const r of rows) {
    if (r.status in counts) counts[r.status as keyof typeof counts] = r.count
  }
  return counts
}

export async function getSellerProfile(userId: string) {
  const [row] = await db
    .select({ phone: user.phone, idImageId: user.idImageId })
    .from(user)
    .where(eq(user.id, userId))
  return { phone: row?.phone ?? null, idImageId: row?.idImageId ?? null }
}

// --- payments --------------------------------------------------------------

export async function getPaymentMethods(opts: { onlyEnabled?: boolean } = {}) {
  return db
    .select()
    .from(paymentMethods)
    .where(opts.onlyEnabled ? eq(paymentMethods.enabled, true) : undefined)
    .orderBy(asc(paymentMethods.sortOrder), asc(paymentMethods.id))
}

// --- orders ----------------------------------------------------------------

async function attachItems<T extends { id: number }>(rows: T[]) {
  if (rows.length === 0) return [] as (T & { items: (typeof orderItems.$inferSelect)[] })[]
  const items = await db
    .select()
    .from(orderItems)
    .where(
      inArray(
        orderItems.orderId,
        rows.map((r) => r.id),
      ),
    )
    .orderBy(asc(orderItems.id))
  return rows.map((r) => ({ ...r, items: items.filter((i) => i.orderId === r.id) }))
}

export async function getOrdersForUser(userId: string) {
  const rows = await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt))
  return attachItems(rows)
}

export async function getOrderForUser(id: number, userId: string, isAdmin: boolean) {
  const [row] = await db
    .select()
    .from(orders)
    .where(isAdmin ? eq(orders.id, id) : and(eq(orders.id, id), eq(orders.userId, userId)))
  if (!row) return null
  const [withItems] = await attachItems([row])
  return withItems
}

/** Admin-only: orders plus buyer and per-item seller contact details. */
export async function getOrdersForAdmin() {
  const rows = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(200)
  if (rows.length === 0) return []
  const items = await db
    .select({
      item: orderItems,
      sellerName: user.name,
      sellerPhone: user.phone,
    })
    .from(orderItems)
    .leftJoin(user, eq(user.id, orderItems.sellerId))
    .where(
      inArray(
        orderItems.orderId,
        rows.map((r) => r.id),
      ),
    )
    .orderBy(asc(orderItems.id))
  return rows.map((r) => ({ ...r, items: items.filter((i) => i.item.orderId === r.id) }))
}

// --- images ----------------------------------------------------------------

export async function getImage(id: string) {
  const [row] = await db.select().from(images).where(eq(images.id, id))
  return row ?? null
}
