import { getI18n } from '@/lib/i18n/server'

type Item = { label: string; value: string | number; tone?: 'primary' | 'success' }

export async function AdminStats({ items }: { items: Item[] }) {
  await getI18n()
  return (
    <dl className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((it) => (
        <div key={it.label} className="rounded-xl border bg-card p-4">
          <dt className="text-xs text-muted-foreground">{it.label}</dt>
          <dd
            className={
              'mt-1 font-mono text-xl font-semibold ' + (it.tone === 'success' ? 'text-success' : it.tone === 'primary' ? 'text-primary' : '')
            }
          >
            {it.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}
