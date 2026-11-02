// Usage: pnpm db:migrate   (needs DATABASE_URL in the environment)
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import pg from 'pg'

const url = process.env.DATABASE_URL
if (!url) {
  console.error('DATABASE_URL is not set.')
  process.exit(1)
}
const here = dirname(fileURLToPath(import.meta.url))
const sql = readFileSync(join(here, '001_schema.sql'), 'utf8')

const client = new pg.Client({ connectionString: url })
await client.connect()
try {
  await client.query('BEGIN')
  await client.query(sql)
  await client.query('COMMIT')
  console.log('Database is up to date.')
} catch (err) {
  await client.query('ROLLBACK')
  console.error('Migration failed:', err.message)
  process.exitCode = 1
} finally {
  await client.end()
}
