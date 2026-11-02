'use client'

import { useEffect } from 'react'
import { useCart } from '@/components/cart-provider'

/** Rendered on the order confirmation page so the cart is emptied after a successful order. */
export function ClearCartOnMount() {
  const { clear, hydrated } = useCart()
  useEffect(() => {
    if (hydrated) clear()
  }, [hydrated, clear])
  return null
}
