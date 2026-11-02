'use client'

import { useEffect, useState } from 'react'
import { refreshCart } from '@/app/actions/orders'
import { resolveImage } from '@/lib/listing-image'
import { useCart } from '@/components/cart-provider'

/** Once the cart is loaded from the browser, replace stale prices and stock with the server's numbers. */
export function useCartSync() {
  const { lines, hydrated, sync } = useCart()
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    if (!hydrated) return
    const ids = lines.map((l) => l.id)
    if (ids.length === 0) return
    let cancelled = false
    setChecking(true)
    refreshCart(ids)
      .then((fresh) => {
        if (cancelled) return
        sync(
          fresh.map((f) => ({
            id: f.id,
            title: f.title,
            price: f.price,
            stock: f.stock,
            image: resolveImage(f),
          })),
        )
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setChecking(false)
      })
    return () => {
      cancelled = true
    }
    // Run once per page visit, right after the cart is read from the browser.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated])

  return { checking }
}
