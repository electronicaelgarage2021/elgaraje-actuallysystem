"use server";

import { createSupabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getClients(busqueda?: string) {
  try {
    const db = createSupabaseServer();
    let query = db
      .from("clientes")
      .select("*")
      .order("created_at", { ascending: false });

    if (busqueda) {
      query = query.or(
        `nombre.ilike.%${busqueda}%,telefono.ilike.%${busqueda}%,dni.ilike.%${busqueda}%`
      );
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  } catch {
    return [];
  }
}

export async function getClient(id: string) {
  const db = createSupabaseServer();
  const { data, error } = await db
    .from("clientes")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function getClientOrders(clienteId: string) {
  const db = createSupabaseServer();
  const { data, error } = await db
    .from("ordenes_reparacion")
    .select("*")
    .eq("cliente_id", clienteId)
    .order("fecha_ingreso", { ascending: false });
  if (error) throw error;
  return data;
}

export async function searchClients(term: string) {
  const db = createSupabaseServer();
  const { data, error } = await db
    .from("clientes")
    .select("id, nombre, telefono, dni")
    .or(
      `nombre.ilike.%${term}%,telefono.ilike.%${term}%,dni.ilike.%${term}%`
    )
    .limit(5);
  if (error) throw error;
  return data;
}

export async function createClient(formData: FormData) {
  const db = createSupabaseServer();
  const { data, error } = await db
    .from("clientes")
    .insert({
      nombre: formData.get("nombre") as string,
      telefono: (formData.get("telefono") as string) || null,
      dni: (formData.get("dni") as string) || null,
      email: (formData.get("email") as string) || null,
      notas: (formData.get("notas") as string) || null,
    })
    .select()
    .single();
  if (error) throw error;
  revalidatePath("/clientes");
  return data;
}

export async function updateClient(id: string, formData: FormData) {
  const db = createSupabaseServer();
  const { error } = await db
    .from("clientes")
    .update({
      nombre: formData.get("nombre") as string,
      telefono: (formData.get("telefono") as string) || null,
      dni: (formData.get("dni") as string) || null,
      email: (formData.get("email") as string) || null,
      notas: (formData.get("notas") as string) || null,
    })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/clientes");
  revalidatePath(`/clientes/${id}`);
}

export async function deleteClient(id: string) {
  const db = createSupabaseServer();
  const { error } = await db.from("clientes").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/clientes");
}
