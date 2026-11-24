import 'server-only'
import { alias } from 'drizzle-orm/pg-core'
import { and, asc, desc, eq, ilike, inArray, ne, or, sql, getTableColumns } from 'drizzle-orm'
import { db } from '@/lib/db'
import { images, listings, orderItems, orders, paymentMethods, user } from '@/lib/db/schema'

// Buyers must never receive a seller's phone number (or the seller's pre-commission price),
// so public queries leave them out.
const { contactPhone: _hidden, sellerPrice: _hiddenSellerPrice, ...publicColumns } = getTableColumns(listings)

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
    .select({ ...publicColumns, sellerPrice: listings.sellerPrice })
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

// --- admin: accounts, sales and totals --------------------------------------
// Everything below is for admin pages only (it includes phone numbers and other private details).

export type AdminUserRow = {
  id: string
  name: string
  email: string
  phone: string | null
  role: string
  idImageId: string | null
  createdAt: Date
  adsCount: number
  ordersCount: number
  spent: number
  soldCount: number
  soldTotal: number
}

const activeOrder = sql`o."status" <> 'cancelled'`

export async function getUsersForAdmin(q?: string): Promise<AdminUserRow[]> {
  const pattern = q ? `%${q.replace(/[%_\\]/g, '\\$&')}%` : null
  return db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      idImageId: user.idImageId,
      createdAt: user.createdAt,
      adsCount: sql<number>`(select count(*)::int from "listings" l where l."userId" = "user"."id")`,
      ordersCount: sql<number>`(select count(*)::int from "orders" o where o."userId" = "user"."id")`,
      spent: sql<number>`(select coalesce(sum(o."total"), 0)::int from "orders" o where o."userId" = "user"."id" and ${activeOrder})`,
      soldCount: sql<number>`(select coalesce(sum(i."quantity"), 0)::int from "order_items" i join "orders" o on o."id" = i."orderId" where i."sellerId" = "user"."id" and ${activeOrder})`,
      soldTotal: sql<number>`(select coalesce(sum(coalesce(i."sellerUnitPrice", i."price") * i."quantity"), 0)::int from "order_items" i join "orders" o on o."id" = i."orderId" where i."sellerId" = "user"."id" and ${activeOrder})`,
    })
    .from(user)
    .where(
      pattern
        ? or(ilike(user.name, pattern), ilike(user.email, pattern), ilike(user.phone, pattern))
        : undefined,
    )
    .orderBy(desc(user.createdAt))
    .limit(500)
}

export async function getAdminStats() {
  const result = await db.execute<{
    users: number
    sellers: number
    ads_live: number
    ads_pending: number
    orders: number
    gross: number
    seller_net: number
  }>(sql`
    select
      (select count(*)::int from "user") as users,
      (select count(distinct "userId")::int from "listings") as sellers,
      (select count(*)::int from "listings" where "status" = 'approved') as ads_live,
      (select count(*)::int from "listings" where "status" = 'pending') as ads_pending,
      (select count(*)::int from "orders") as orders,
      (select coalesce(sum(i."price" * i."quantity"), 0)::bigint from "order_items" i join "orders" o on o."id" = i."orderId" where o."status" <> 'cancelled') as gross,
      (select coalesce(sum(coalesce(i."sellerUnitPrice", i."price") * i."quantity"), 0)::bigint from "order_items" i join "orders" o on o."id" = i."orderId" where o."status" <> 'cancelled') as seller_net
  `)
  const row = result.rows[0]
  return {
    users: Number(row.users),
    sellers: Number(row.sellers),
    adsLive: Number(row.ads_live),
    adsPending: Number(row.ads_pending),
    orders: Number(row.orders),
    gross: Number(row.gross),
    sellerNet: Number(row.seller_net),
    commission: Number(row.gross) - Number(row.seller_net),
  }
}

export async function getUserForAdmin(id: string) {
  const [u] = await db.select().from(user).where(eq(user.id, id))
  if (!u) return null

  const ads = await db.select().from(listings).where(eq(listings.userId, id)).orderBy(desc(listings.updatedAt))
  const purchases = await getOrdersForUser(id)

  const buyer = alias(user, 'buyer')
  const sales = await db
    .select({
      item: orderItems,
      order: orders,
      buyerName: buyer.name,
      buyerEmail: buyer.email,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orders.id, orderItems.orderId))
    .leftJoin(buyer, eq(buyer.id, orders.userId))
    .where(eq(orderItems.sellerId, id))
    .orderBy(desc(orders.createdAt))
    .limit(300)

  return { user: u, ads, purchases, sales }
}

export type SalesFilter = 'all' | 'active' | 'cancelled'

/** Every item that was bought: who bought it, who sold it, and how the price splits into seller + commission. */
export async function getSalesForAdmin(filter: SalesFilter = 'all') {
  const buyer = alias(user, 'buyer')
  const seller = alias(user, 'seller')
  return db
    .select({
      item: orderItems,
      order: orders,
      buyerName: buyer.name,
      buyerEmail: buyer.email,
      sellerName: seller.name,
      sellerEmail: seller.email,
      sellerPhone: seller.phone,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orders.id, orderItems.orderId))
    .leftJoin(buyer, eq(buyer.id, orders.userId))
    .leftJoin(seller, eq(seller.id, orderItems.sellerId))
    .where(
      filter === 'cancelled' ? eq(orders.status, 'cancelled') : filter === 'active' ? ne(orders.status, 'cancelled') : undefined,
    )
    .orderBy(desc(orders.createdAt), asc(orderItems.id))
    .limit(500)
}
