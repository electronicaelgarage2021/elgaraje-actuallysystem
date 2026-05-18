"use server";

import { createSupabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getTareas(fecha?: string) {
  const db = createSupabaseServer();
  const target = fecha || new Date().toISOString().split("T")[0];
  const { data, error } = await db
    .from("tareas")
    .select("*")
    .eq("fecha", target)
    .order("posicion", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function createTarea(texto: string) {
  const db = createSupabaseServer();
  const hoy = new Date().toISOString().split("T")[0];
  // Get max position
  const { data: existing } = await db
    .from("tareas")
    .select("posicion")
    .eq("fecha", hoy)
    .order("posicion", { ascending: false })
    .limit(1);
  const nextPos = existing && existing.length > 0 ? existing[0].posicion + 1 : 0;

  const { error } = await db.from("tareas").insert({ texto, fecha: hoy, posicion: nextPos });
  if (error) throw error;
  revalidatePath("/");
}

export async function toggleTarea(id: string, completada: boolean) {
  const db = createSupabaseServer();
  const { error } = await db.from("tareas").update({ completada }).eq("id", id);
  if (error) throw error;
  revalidatePath("/");
}

export async function deleteTarea(id: string) {
  const db = createSupabaseServer();
  const { error } = await db.from("tareas").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/");
}

export async function updateTareaTexto(id: string, texto: string) {
  const db = createSupabaseServer();
  const { error } = await db.from("tareas").update({ texto }).eq("id", id);
  if (error) throw error;
  revalidatePath("/");
}

export async function reorderTareas(orderedIds: string[]) {
  const db = createSupabaseServer();
  // Update positions based on array order
  for (let i = 0; i < orderedIds.length; i++) {
    await db.from("tareas").update({ posicion: i }).eq("id", orderedIds[i]);
  }
  revalidatePath("/");
}
