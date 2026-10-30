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
  LIVEKIT_URL: z.string().default('wss://livekit.intellmeet.internal'),
  LIVEKIT_API_KEY: z.string().default('devkey_intellmeet'),
  LIVEKIT_API_SECRET: z.string().default('secret_intellmeet_key_abcdef123456'),
  STUN_SERVERS: z.string().default('stun:stun.l.google.com:19302,stun:stun1.l.google.com:19302,stun:stun2.l.google.com:19302'),
  TURN_SERVERS: z.string().optional().default(''),
  TURN_USERNAME: z.string().optional().default(''),
  TURN_CREDENTIAL: z.string().optional().default(''),
  S3_ENDPOINT: z.string().optional().default(''),
  S3_REGION: z.string().default('auto'),
  S3_BUCKET_NAME: z.string().default('intellmeet-recordings'),
  S3_ACCESS_KEY_ID: z.string().optional().default(''),
  S3_SECRET_ACCESS_KEY: z.string().optional().default(''),
  S3_PUBLIC_URL: z.string().default('https://storage.intellmeet.io/recordings'),
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
