import { createClient } from "@supabase/supabase-js";

// Cliente de servidor. Usa la service_role key (privada, solo server-side) para
// poder operar aunque la base esté cerrada por RLS al rol anónimo.
// Si por algún motivo la service key no estuviera configurada, cae a la anon
// para no romper, pero avisa fuerte en los logs.
export function createSupabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!serviceKey) {
    console.error(
      "[supabase] SUPABASE_SERVICE_ROLE_KEY no está seteada — usando anon key. " +
        "La app no funcionará bien si la base está cerrada por RLS."
    );
  }

  return createClient(url, serviceKey || anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
