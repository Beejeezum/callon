import "server-only";
import { createClient } from "@supabase/supabase-js";
import { publicEnv } from "./public-env";
import { serverEnv } from "./server-env";
import type { Database } from "@/types/database";

export function createSupabaseServiceClient() {
  if (
    !publicEnv.NEXT_PUBLIC_SUPABASE_URL ||
    !serverEnv.SUPABASE_SERVICE_ROLE_KEY
  ) {
    throw new Error("Supabase service configuration is missing.");
  }

  return createClient<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
