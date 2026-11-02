'use client'

import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { useCart } from '@/components/cart-provider'
import { useI18n } from '@/components/i18n-provider'

export function CartLink() {
  const { count, hydrated } = useCart()
  const { t } = useI18n()
  const shown = hydrated ? count : 0
  return (
    <Link
      href="/cart"
      aria-label={shown > 0 ? t('nav.cartCount', { n: shown }) : t('nav.cart')}
      className={buttonVariants({ variant: 'ghost', size: 'icon' }) + ' relative'}
    >
      <ShoppingCart aria-hidden="true" />
      {shown > 0 && (
        <span className="absolute -end-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 font-mono text-[10px] leading-4 font-semibold text-primary-foreground">
          {shown > 99 ? '99+' : shown}
        </span>
      )}
    </Link>
  )
}
