'use client'

import { useRouter } from 'next/navigation'
import { ShoppingCart, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useCart, type CartItemInput } from '@/components/cart-provider'
import { useI18n } from '@/components/i18n-provider'

type Props = {
  item: CartItemInput
  /** "Buy now" adds the item and goes straight to checkout. */
  buyNow?: boolean
  size?: 'default' | 'sm' | 'lg'
  className?: string
}

export function AddToCartButton({ item, buyNow = false, size = 'default', className }: Props) {
  const { add } = useCart()
  const { t } = useI18n()
  const router = useRouter()
  const soldOut = item.stock <= 0

  function onClick() {
    const result = add(item)
    if (result === 'soldout') return
    if (buyNow) {
      router.push('/checkout')
      return
    }
    if (result === 'max') toast.message(t('cart.maxStock', { n: item.stock }))
    else
      toast.success(t('cart.added'), {
        description: item.title,
        action: { label: t('cart.view'), onClick: () => router.push('/cart') },
      })
  }

  return (
    <Button
      type="button"
      size={size}
      variant={buyNow ? 'default' : 'outline'}
      disabled={soldOut}
      onClick={onClick}
      className={className}
    >
      {buyNow ? <Zap aria-hidden="true" /> : <ShoppingCart aria-hidden="true" />}
      {soldOut ? t('detail.soldOut') : buyNow ? t('detail.buyNow') : t('detail.addToCart')}
    </Button>
  )
}
