import type { Metadata } from 'next'
import { getI18n } from '@/lib/i18n/server'
import { CartView } from '@/components/cart-view'

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n()
  return { title: t('meta.cart') }
}

export default async function CartPage() {
  const { t } = await getI18n()
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">{t('cart.title')}</h1>
      <CartView />
    </div>
  )
}
