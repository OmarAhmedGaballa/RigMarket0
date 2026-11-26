import { Mail } from 'lucide-react'
import { SUPPORT_EMAIL } from '@/lib/config'
import { getLegalDoc, type LegalPageKey } from '@/lib/legal-content'
import { getI18n } from '@/lib/i18n/server'

/** Shared layout for /privacy, /terms and /data-deletion. Text lives in lib/legal-content.ts (English + Arabic). */
export async function LegalPage({ page }: { page: LegalPageKey }) {
  const { locale, t } = await getI18n()
  const doc = getLegalDoc(page, locale)

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-balance">{doc.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{doc.updated}</p>
      <p className="mt-6 leading-relaxed text-muted-foreground">{doc.intro}</p>

      <div className="mt-6 flex flex-wrap items-center gap-3 rounded-xl border bg-card p-4">
        <Mail className="size-5 text-primary" aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{t('legal.contact')}</p>
          <a href={`mailto:${SUPPORT_EMAIL}`} dir="ltr" className="font-mono font-medium text-primary hover:underline">
            {SUPPORT_EMAIL}
          </a>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-8">
        {doc.sections.map((s, i) => (
          <section key={s.h}>
            <h2 className="text-lg font-semibold">
              {i + 1}. {s.h}
            </h2>
            {s.p.map((para) => (
              <p key={para} className="mt-2 leading-relaxed text-muted-foreground">
                {para}
              </p>
            ))}
            {s.list && (
              <ul className="mt-2 flex list-disc flex-col gap-1.5 ps-6 leading-relaxed text-muted-foreground marker:text-primary">
                {s.list.map((li) => (
                  <li key={li}>{li}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </article>
  )
}
