// TEMPORAL — diagnóstico de env vars en producción. Borrar después.
// No revela valores, solo si están presentes y su largo.
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    APP_PIN_present: !!process.env.APP_PIN,
    APP_PIN_len: (process.env.APP_PIN ?? "").length,
    SESSION_SECRET_present: !!process.env.SESSION_SECRET,
    SESSION_SECRET_len: (process.env.SESSION_SECRET ?? "").length,
    SERVICE_KEY_present: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  });
}
