"use server";

import { createSupabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getRepuestosPendientes() {
  const db = createSupabaseServer();
  const { data, error } = await db
    .from("repuestos")
    .select("*, orden:ordenes_reparacion(numero, dispositivo)")
    .eq("pedido", false)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function createRepuesto(nombre: string, ordenId?: string) {
  const db = createSupabaseServer();
  const { error } = await db.from("repuestos").insert({
    nombre,
    orden_id: ordenId || null,
  });
  if (error) throw error;
  revalidatePath("/proveedores");
}

export async function assignRepuesto(id: string, proveedor: "cordoba" | "vcp" | null) {
  const db = createSupabaseServer();
  const { error } = await db.from("repuestos").update({ proveedor }).eq("id", id);
  if (error) throw error;
  revalidatePath("/proveedores");
}

export async function assignAllRepuestos(proveedor: "cordoba" | "vcp") {
  const db = createSupabaseServer();
  // Assign all unassigned repuestos to this provider
  const { error } = await db
    .from("repuestos")
    .update({ proveedor })
    .is("proveedor", null)
    .eq("pedido", false);
  if (error) throw error;
  revalidatePath("/proveedores");
}

export async function markRepuestosPedidos(proveedor: "cordoba" | "vcp") {
  const db = createSupabaseServer();
  const { error } = await db
    .from("repuestos")
    .update({ pedido: true })
    .eq("proveedor", proveedor)
    .eq("pedido", false);
  if (error) throw error;
  revalidatePath("/proveedores");
}

export async function deleteRepuesto(id: string) {
  const db = createSupabaseServer();
  const { error } = await db.from("repuestos").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/proveedores");
}
