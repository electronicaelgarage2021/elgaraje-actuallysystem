import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { COOKIE_NAME, decryptSession } from "@/lib/session";

// Toda consulta privilegiada valida la sesión junto al acceso a los datos.
// La service_role key saltea RLS y nunca debe usarse sin esta comprobación.
export async function requireSession() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  const session = await decryptSession(token);
  if (!session) throw new Error("No autorizado");
}

export async function createSupabaseServer() {
  await requireSession();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY no está configurada");
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
