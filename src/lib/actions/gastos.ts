"use server";

import { createSupabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createGasto(formData: FormData) {
  const db = createSupabaseServer();
  const descripcion = formData.get("descripcion") as string;
  const monto = Number(formData.get("monto"));
  const categoria = (formData.get("categoria") as string) || "otro";
  const metodo = (formData.get("metodo") as string) || "efectivo";

  const { error } = await db.from("gastos").insert({
    descripcion,
    monto,
    categoria,
    metodo,
  });
  if (error) throw error;

  revalidatePath("/caja");
}

export async function deleteGasto(id: string) {
  const db = createSupabaseServer();
  const { error } = await db.from("gastos").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/caja");
}

export async function getDailyGastos(fecha?: string, fechaHasta?: string) {
  const db = createSupabaseServer();
  const desde = fecha || new Date().toISOString().split("T")[0];
  const hasta = fechaHasta || desde;

  const { data, error } = await db
    .from("gastos")
    .select("*")
    .gte("created_at", `${desde}T00:00:00`)
    .lt("created_at", `${hasta}T23:59:59.999`)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
}
