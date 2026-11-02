import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { CATEGORIES, categoryName } from '@/lib/categories'
import { SUPPORT_WHATSAPP_DISPLAY, whatsappLink } from '@/lib/config'
import { getI18n } from '@/lib/i18n/server'
import { buttonVariants } from '@/components/ui/button'

export async function SiteFooter() {
  const { t, locale } = await getI18n()
  return (
    <footer className="mt-16 border-t pb-20 sm:pb-0">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-[1.2fr_1.4fr_1fr] md:px-6">
        <div className="max-w-sm">
          <p className="font-semibold">RigMarket</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t('footer.about')}</p>
        </div>
        <ul className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:grid-cols-3">
          {CATEGORIES.slice(0, 9).map((c) => (
            <li key={c.slug}>
              <Link href={`/listings?category=${c.slug}`} className="text-muted-foreground hover:text-foreground">
                {categoryName(c, locale)}
              </Link>
            </li>
          ))}
        </ul>
        <div>
          <p className="font-semibold">{t('footer.support.title')}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t('footer.support.text')}</p>
          <p className="mt-2 font-mono text-lg font-semibold" dir="ltr">
            {SUPPORT_WHATSAPP_DISPLAY}
          </p>
          <a
            href={whatsappLink(t('wa.greeting'))}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: 'outline', className: 'mt-3' })}
          >
            <MessageCircle aria-hidden="true" />
            {t('footer.support.cta')}
          </a>
        </div>
      </div>
    </footer>
  )
}
