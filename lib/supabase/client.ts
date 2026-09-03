import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client. Safe to call multiple times; the SDK reuses the
 * underlying session. Row types are applied per-query via `.overrideTypes<T>()`
 * (see lib/supabase/types.ts) rather than the `Database` generic, since this
 * project's installed supabase-js version resolves that generic to `never`
 * unless every table also declares `Relationships`/`Views`/`Functions` in a
 * shape it can infer cleanly.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
