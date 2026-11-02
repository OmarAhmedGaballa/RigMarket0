import type { Metadata } from 'next'
import { requireUser } from '@/lib/session'
import { getPaymentMethods } from '@/lib/queries'
import { getI18n } from '@/lib/i18n/server'
import { CheckoutForm } from '@/components/checkout-form'

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n()
  return { title: t('meta.checkout') }
}

export default async function CheckoutPage() {
  const user = await requireUser('/sign-in?next=/checkout')
  const [{ t }, methods] = await Promise.all([getI18n(), getPaymentMethods({ onlyEnabled: true })])

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">{t('checkout.title')}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t('checkout.subtitle')}</p>
      <CheckoutForm methods={methods} defaultName={user.name} />
    </div>
  )
}
