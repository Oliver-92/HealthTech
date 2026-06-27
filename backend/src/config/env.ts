import { z } from 'zod'
import 'dotenv/config'

const duration = (field: string) =>
  z.string().regex(/^\d+(ms|s|m|h|d|w|y)?$/, `${field} must look like "15m", "7d" or "3600"`)

const envSchema = z.object({
  PORT: z.coerce.number().default(8080),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Access token: short-lived, sent as a Bearer header and kept in memory on the client.
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  JWT_EXPIRES_IN: duration('JWT_EXPIRES_IN').default('15m'),

  // Refresh token: long-lived, stored in an httpOnly cookie and rotated on each refresh.
  JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET must be at least 16 characters'),
  JWT_REFRESH_EXPIRES_IN: duration('JWT_REFRESH_EXPIRES_IN').default('7d'),

  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().url('FRONTEND_URL must be a valid URL').default('http://localhost:5173'),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌  Invalid environment variables:')
  console.error(parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data
