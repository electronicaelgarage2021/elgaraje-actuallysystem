"use server";

import { createSupabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getVentas(desde?: string, hasta?: string) {
  const db = createSupabaseServer();
  const today = new Date().toISOString().split("T")[0];
  const d = desde || today;
  const h = hasta || d;

  const { data, error } = await db
    .from("ventas")
    .select("*")
    .gte("created_at", `${d}T00:00:00`)
    .lt("created_at", `${h}T23:59:59.999`)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createVenta(formData: FormData) {
  const db = createSupabaseServer();

  const producto = formData.get("producto") as string;
  const monto = Number(formData.get("monto"));
  const metodo = formData.get("metodo") as string;
  const nota = (formData.get("nota") as string) || null;

  const { error } = await db.from("ventas").insert({
    producto,
    monto,
    metodo,
    nota,
  });

  if (error) throw error;
  revalidatePath("/ventas");
}

export async function deleteVenta(id: string) {
  const db = createSupabaseServer();

  const { error } = await db.from("ventas").delete().eq("id", id);

  if (error) throw error;
  revalidatePath("/ventas");
  revalidatePath("/caja");
}

export async function getVentasStats(desde?: string, hasta?: string) {
  const db = createSupabaseServer();
  const today = new Date().toISOString().split("T")[0];
  const d = desde || today;
  const h = hasta || d;

  const { data, error } = await db
    .from("ventas")
    .select("monto, metodo")
    .gte("created_at", `${d}T00:00:00`)
    .lt("created_at", `${h}T23:59:59.999`);

  if (error) throw error;

  const ventas = data || [];
  const total = ventas.reduce((sum, v) => sum + Number(v.monto), 0);
  const cantidad = ventas.length;
  const porMetodo: Record<string, number> = {};

  for (const v of ventas) {
    porMetodo[v.metodo] = (porMetodo[v.metodo] || 0) + Number(v.monto);
  }

  return { total, cantidad, porMetodo };
}
