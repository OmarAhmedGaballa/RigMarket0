'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

export type CartLine = {
  id: number
  qty: number
  title: string
  price: number
  stock: number
  image: string
}

export type CartItemInput = Omit<CartLine, 'qty'>
type AddResult = 'added' | 'max' | 'soldout'

type CartValue = {
  lines: CartLine[]
  count: number
  total: number
  hydrated: boolean
  add: (item: CartItemInput, qty?: number) => AddResult
  setQty: (id: number, qty: number) => void
  remove: (id: number) => void
  clear: () => void
  /** Replace stale price/stock with fresh data; drops items that are no longer for sale. */
  sync: (fresh: CartItemInput[]) => void
}

const STORAGE_KEY = 'rigmarket-cart-v1'
const CartContext = createContext<CartValue | null>(null)

function read(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const data: unknown = JSON.parse(raw)
    if (!Array.isArray(data)) return []
    return data
      .filter(
        (l): l is CartLine =>
          l && Number.isInteger(l.id) && Number.isInteger(l.qty) && l.qty > 0 && typeof l.title === 'string',
      )
      .slice(0, 30)
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([])
  const [hydrated, setHydrated] = useState(false)
  // The ref always holds the latest cart so add() can report the result synchronously.
  const linesRef = useRef<CartLine[]>([])

  const commit = useCallback((next: CartLine[]) => {
    linesRef.current = next
    setLines(next)
  }, [])

  useEffect(() => {
    commit(read())
    setHydrated(true)
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) commit(read())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [commit])

  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
    } catch {
      /* storage full or blocked: the cart still works for this tab */
    }
  }, [lines, hydrated])

  const add = useCallback<CartValue['add']>(
    (item, qty = 1) => {
      if (item.stock <= 0) return 'soldout'
      const prev = linesRef.current
      const existing = prev.find((l) => l.id === item.id)
      const wanted = (existing?.qty ?? 0) + qty
      const next = Math.min(wanted, item.stock)
      commit(
        existing
          ? prev.map((l) => (l.id === item.id ? { ...l, ...item, qty: next } : l))
          : [...prev, { ...item, qty: next }],
      )
      return next < wanted ? 'max' : 'added'
    },
    [commit],
  )

  const setQty = useCallback(
    (id: number, qty: number) => {
      commit(
        linesRef.current.map((l) =>
          l.id === id ? { ...l, qty: Math.max(1, Math.min(qty, Math.max(1, l.stock))) } : l,
        ),
      )
    },
    [commit],
  )

  const remove = useCallback((id: number) => commit(linesRef.current.filter((l) => l.id !== id)), [commit])
  const clear = useCallback(() => commit([]), [commit])

  const sync = useCallback<CartValue['sync']>(
    (fresh) => {
      const byId = new Map(fresh.map((f) => [f.id, f]))
      commit(
        linesRef.current
          .filter((l) => byId.has(l.id))
          .map((l) => {
            const f = byId.get(l.id)!
            return { ...l, ...f, qty: Math.max(1, Math.min(l.qty, Math.max(1, f.stock))) }
          }),
      )
    },
    [commit],
  )

  const value = useMemo<CartValue>(
    () => ({
      lines,
      hydrated,
      count: lines.reduce((n, l) => n + l.qty, 0),
      total: lines.reduce((n, l) => n + l.qty * l.price, 0),
      add,
      setQty,
      remove,
      clear,
      sync,
    }),
    [lines, hydrated, add, setQty, remove, clear, sync],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}
