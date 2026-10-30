import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  API_PREFIX: z.string().default('/api'),
  CORS_ORIGIN: z.string().default('http://localhost:5173,http://localhost:3000'),
  MONGO_URI: z.string().default('mongodb://127.0.0.1:27017/intellimeet'),
  JWT_SECRET: z.string().default('intellmeet_access_jwt_secret_key_12345'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().default('intellmeet_refresh_jwt_secret_key_67890'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  COOKIE_SECRET: z.string().default('intellmeet_cookie_signing_secret_999'),
  OPENAI_API_KEY: z.string().optional().default(''),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),
  RATE_LIMIT_MAX: z.coerce.number().default(200),
})

const parsedEnv = envSchema.safeParse(process.env)

if (!parsedEnv.success) {
  console.error('❌ Invalid environment configuration:', parsedEnv.error.format())
  process.exit(1)
}

export const env = {
  ...parsedEnv.data,
  corsOrigins: parsedEnv.data.CORS_ORIGIN.split(',').map((o) => o.trim()),
  isDev: parsedEnv.data.NODE_ENV === 'development',
  isProd: parsedEnv.data.NODE_ENV === 'production',
  isTest: parsedEnv.data.NODE_ENV === 'test',
}

export type EnvConfig = typeof env
