import { createClient } from '@supabase/supabase-js'

// Ez a kliens szerver oldalon fut, megkerüli az RLS-t.
// SOHA ne küldd el a kliensnek a service role key-t!
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
