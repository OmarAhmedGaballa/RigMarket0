'use server'

import { and, asc, eq, inArray, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { listings, orderItems, orders, paymentMethods, ORDER_STATUSES, PAYMENT_STATUSES } from '@/lib/db/schema'
import { getCurrentUser } from '@/lib/session'
import { MAX_CART_LINES, MAX_QTY_PER_LINE } from '@/lib/config'
import { getI18n } from '@/lib/i18n/server'
import { normalizePhone, text } from '@/lib/validation'
import type { FormState } from './listings'

export type CartSnapshot = {
  id: number
  title: string
  price: number
  stock: number
  imageUrl: string | null
  category: string
}

/** Current price and stock for cart lines. The cart in the browser is never trusted for prices. */
export async function refreshCart(ids: number[]): Promise<CartSnapshot[]> {
  const clean = [...new Set(ids.filter((n) => Number.isInteger(n) && n > 0))].slice(0, MAX_CART_LINES)
  if (clean.length === 0) return []
  return db
    .select({
      id: listings.id,
      title: listings.title,
      price: listings.price,
      stock: listings.stock,
      imageUrl: listings.imageUrl,
      category: listings.category,
    })
    .from(listings)
    .where(and(inArray(listings.id, clean), eq(listings.status, 'approved')))
}

class OrderError extends Error {}

type Line = { id: number; qty: number }

function parseCart(raw: FormDataEntryValue | null): Line[] | null {
  if (typeof raw !== 'string') return null
  try {
    const data: unknown = JSON.parse(raw)
    if (!Array.isArray(data)) return null
    const merged = new Map<number, number>()
    for (const row of data) {
      const id = Number((row as { id?: unknown })?.id)
      const qty = Number((row as { qty?: unknown })?.qty)
      if (!Number.isInteger(id) || id <= 0 || !Number.isInteger(qty) || qty <= 0) return null
      merged.set(id, Math.min(MAX_QTY_PER_LINE, (merged.get(id) ?? 0) + qty))
    }
    return [...merged].map(([id, qty]) => ({ id, qty }))
  } catch {
    return null
  }
}

export async function placeOrder(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser()
  const { t } = await getI18n()
  if (!user) return { error: t('err.signIn') }

  const lines = parseCart(formData.get('cart'))
  if (!lines || lines.length === 0) return { error: t('err.cartEmpty') }
  if (lines.length > MAX_CART_LINES) return { error: t('err.cartTooMany') }

  const fullName = text(formData, 'fullName', 100)
  const phone = normalizePhone(text(formData, 'phone', 30))
  const city = text(formData, 'city', 80)
  const address = text(formData, 'address', 300)
  const notes = text(formData, 'notes', 500)
  const paymentCode = text(formData, 'paymentMethod', 40)
  const reference = text(formData, 'paymentReference', 80)

  if (fullName.length < 2) return { error: t('err.name') }
  if (!phone) return { error: t('err.phone') }
  if (city.length < 2) return { error: t('err.city') }
  if (address.length < 5) return { error: t('err.address') }

  const [method] = await db
    .select()
    .from(paymentMethods)
    .where(and(eq(paymentMethods.code, paymentCode), eq(paymentMethods.enabled, true)))
  if (!method) return { error: t('err.payment') }
  if (method.requiresReference && reference.length < 3) return { error: t('err.reference') }

  let orderId: number
  try {
    orderId = await db.transaction(async (tx) => {
      // Lock the rows so two buyers can't both take the last item.
      const ids = lines.map((l) => l.id)
      const rows = await tx
        .select()
        .from(listings)
        .where(inArray(listings.id, ids))
        .orderBy(asc(listings.id))
        .for('update')
      const byId = new Map(rows.map((r) => [r.id, r]))

      let total = 0
      for (const line of lines) {
        const row = byId.get(line.id)
        if (!row || row.status !== 'approved') {
          throw new OrderError(t('err.cartUnavailable', { title: row?.title ?? `#${line.id}` }))
        }
        if (row.userId === user.id) throw new OrderError(t('err.cartOwn'))
        if (row.stock < line.qty) {
          throw new OrderError(
            row.stock <= 0
              ? t('err.cartUnavailable', { title: row.title })
              : t('err.cartStock', { title: row.title, n: row.stock }),
          )
        }
        total += row.price * line.qty
      }
      if (total > 2_000_000_000) throw new OrderError(t('err.invalid'))

      const [order] = await tx
        .insert(orders)
        .values({
          userId: user.id,
          fullName,
          phone,
          city,
          address,
          notes: notes || null,
          paymentMethodCode: method.code,
          paymentMethodName: method.nameEn,
          paymentReference: method.requiresReference ? reference : null,
          total,
        })
        .returning({ id: orders.id })

      await tx.insert(orderItems).values(
        lines.map((line) => {
          const row = byId.get(line.id)!
          return {
            orderId: order.id,
            listingId: row.id,
            sellerId: row.userId,
            title: row.title,
            price: row.price,
            quantity: line.qty,
            imageUrl: row.imageUrl,
          }
        }),
      )

      for (const line of lines) {
        await tx
          .update(listings)
          .set({ stock: sql`${listings.stock} - ${line.qty}`, updatedAt: new Date() })
          .where(eq(listings.id, line.id))
      }
      return order.id
    })
  } catch (err) {
    if (err instanceof OrderError) return { error: err.message }
    console.error('placeOrder failed', err)
    return { error: t('err.generic') }
  }

  revalidatePath('/', 'layout')
  redirect(`/orders/${orderId}?placed=1`)
}

/** Cancels an order and puts the items back in stock. Cancelled is final. */
async function cancelAndRestock(orderId: number, onlyForUser?: string) {
  return db.transaction(async (tx) => {
    const [order] = await tx
      .select()
      .from(orders)
      .where(onlyForUser ? and(eq(orders.id, orderId), eq(orders.userId, onlyForUser)) : eq(orders.id, orderId))
      .for('update')
    if (!order || order.status === 'cancelled') return false
    // Buyers can only cancel before the store confirms the order.
    if (onlyForUser && order.status !== 'placed') return false

    const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, orderId))
    for (const item of items) {
      if (item.listingId) {
        await tx
          .update(listings)
          .set({ stock: sql`${listings.stock} + ${item.quantity}`, updatedAt: new Date() })
          .where(eq(listings.id, item.listingId))
      }
    }
    await tx.update(orders).set({ status: 'cancelled', updatedAt: new Date() }).where(eq(orders.id, orderId))
    return true
  })
}

export async function cancelMyOrder(orderId: number) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Unauthorized')
  await cancelAndRestock(orderId, user.id)
  revalidatePath('/', 'layout')
}

export async function adminUpdateOrder(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser()
  const { t } = await getI18n()
  if (!user || user.role !== 'admin') return { error: t('err.unauthorized') }

  const id = Number(formData.get('id'))
  const status = text(formData, 'status', 20)
  const paymentStatus = text(formData, 'paymentStatus', 20)
  if (!Number.isInteger(id)) return { error: t('err.invalid') }
  if (!(ORDER_STATUSES as readonly string[]).includes(status)) return { error: t('err.invalid') }
  if (!(PAYMENT_STATUSES as readonly string[]).includes(paymentStatus)) return { error: t('err.invalid') }

  const [existing] = await db.select().from(orders).where(eq(orders.id, id))
  if (!existing) return { error: t('err.invalid') }
  if (existing.status === 'cancelled') return { error: t('err.invalid') }

  if (status === 'cancelled') {
    await cancelAndRestock(id)
    await db.update(orders).set({ paymentStatus, updatedAt: new Date() }).where(eq(orders.id, id))
  } else {
    await db.update(orders).set({ status, paymentStatus, updatedAt: new Date() }).where(eq(orders.id, id))
  }

  revalidatePath('/', 'layout')
  return { success: t('ao.saved') }
}
