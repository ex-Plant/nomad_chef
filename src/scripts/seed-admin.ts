import { getPayload } from 'payload'
import config from '../payload.config.js'

function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) throw new Error(`Missing required env var: ${key}`)
  return value
}

const email = requireEnv('SEED_ADMIN_EMAIL')
const password = requireEnv('SEED_ADMIN_PASSWORD')

const payload = await getPayload({ config })

const existing = await payload.find({
  collection: 'users',
  where: { email: { equals: email } },
  limit: 1,
})

if (existing.totalDocs > 0) {
  payload.logger.info(`Admin ${email} already exists — skipping`)
} else {
  await payload.create({
    collection: 'users',
    data: { email, password },
  })
  payload.logger.info(`Admin ${email} created`)
}

process.exit(0)
