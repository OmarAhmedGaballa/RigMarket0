import { MessageCircle } from 'lucide-react'
import { SUPPORT_WHATSAPP_DISPLAY, whatsappLink } from '@/lib/config'
import { getI18n } from '@/lib/i18n/server'

/** Floating customer-service button. WhatsApp only: the number is not for phone calls. */
export async function WhatsAppButton() {
  const { t } = await getI18n()
  return (
    <a
      href={whatsappLink(t('wa.greeting'))}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${t('wa.label')} — ${t('wa.note')}: ${SUPPORT_WHATSAPP_DISPLAY}`}
      className="fixed end-4 bottom-4 z-40 flex items-center gap-3 rounded-full bg-[#25D366] p-3.5 text-[#06260f] shadow-lg outline-none transition-transform hover:scale-[1.03] focus-visible:ring-3 focus-visible:ring-ring sm:py-2.5 sm:pe-5 sm:ps-3.5"
    >
      <MessageCircle className="size-6 shrink-0" aria-hidden="true" />
      <span className="hidden flex-col leading-tight sm:flex">
        <span className="text-sm font-semibold">{t('wa.label')}</span>
        <span className="text-xs">
          {t('wa.note')} · <bdi dir="ltr">{SUPPORT_WHATSAPP_DISPLAY}</bdi>
        </span>
      </span>
    </a>
  )
}
