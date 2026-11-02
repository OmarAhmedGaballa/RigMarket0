import type { Metadata } from 'next'
import { requireUser } from '@/lib/session'
import { getSellerProfile } from '@/lib/queries'
import { getI18n } from '@/lib/i18n/server'
import { ListingForm } from '@/components/listing-form'
import { SellerVerificationForm } from '@/components/seller-verification-form'

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n()
  return { title: t('meta.sell') }
}

export default async function SellPage() {
  const user = await requireUser('/sign-in?next=/sell')
  const [{ t }, profile] = await Promise.all([getI18n(), getSellerProfile(user.id)])
  // Admins post their own ads without verification; everyone else needs a phone number and an ID photo.
  const verified = user.role === 'admin' || (!!profile.phone && !!profile.idImageId)

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 md:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">{t('sell.title')}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t('sell.subtitle')}</p>
      {verified ? (
        <ListingForm mode="create" />
      ) : (
        <SellerVerificationForm defaultPhone={profile.phone ?? ''} hasId={!!profile.idImageId} />
      )}
    </div>
  )
}
