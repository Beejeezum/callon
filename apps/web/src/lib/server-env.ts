import "server-only";
import { z } from "zod";

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  PILOT_ADMIN_EMAIL_SHA256: z
    .string()
    .regex(/^[a-f0-9]{64}$/)
    .optional(),
  SHARE_TOKEN_PEPPER: z.string().min(32).optional(),
  LOCATION_ENCRYPTION_KEY_V1: z.string().min(32).optional(),
  CRON_SECRET: z.string().min(16).optional(),
  EMAIL_PROVIDER: z.enum(["mock", "resend"]).default("mock"),
  RESEND_API_KEY: z.string().min(1).optional(),
  EMAIL_FROM: z.string().min(3).default("Call On <hello@example.test>"),
  AI_DRAFTS_ENABLED: z.enum(["true", "false"]).default("false"),
  WHATSAPP_ENABLED: z.enum(["true", "false"]).default("false"),
  WHATSAPP_VERIFY_TOKEN: z.string().min(1).optional(),
  WHATSAPP_APP_SECRET: z.string().min(1).optional(),
});

export const serverEnv = serverSchema.parse({
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  PILOT_ADMIN_EMAIL_SHA256: process.env.PILOT_ADMIN_EMAIL_SHA256,
  SHARE_TOKEN_PEPPER: process.env.SHARE_TOKEN_PEPPER,
  LOCATION_ENCRYPTION_KEY_V1: process.env.LOCATION_ENCRYPTION_KEY_V1,
  CRON_SECRET: process.env.CRON_SECRET,
  EMAIL_PROVIDER: process.env.EMAIL_PROVIDER,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM,
  AI_DRAFTS_ENABLED: process.env.AI_DRAFTS_ENABLED,
  WHATSAPP_ENABLED: process.env.WHATSAPP_ENABLED,
  WHATSAPP_VERIFY_TOKEN: process.env.WHATSAPP_VERIFY_TOKEN,
  WHATSAPP_APP_SECRET: process.env.WHATSAPP_APP_SECRET,
});
