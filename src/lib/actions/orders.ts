"use server";

import { createSupabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { EstadoOrden } from "@/lib/types";

export async function getOrders(filters?: {
  estado?: EstadoOrden;
  busqueda?: string;
}) {
  try {
    const db = createSupabaseServer();
    let query = db
      .from("ordenes_reparacion")
      .select("*, cliente:clientes(*)")
      .order("fecha_ingreso", { ascending: false });

    if (filters?.estado) {
      query = query.eq("estado", filters.estado);
    }
    if (filters?.busqueda) {
      query = query.or(
        `dispositivo.ilike.%${filters.busqueda}%,problema.ilike.%${filters.busqueda}%,cliente.nombre.ilike.%${filters.busqueda}%`
      );
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  } catch {
    return [];
  }
}

export async function getOrder(id: string) {
  const db = createSupabaseServer();
  const { data, error } = await db
    .from("ordenes_reparacion")
    .select("*, cliente:clientes(*)")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function getOrderHistory(ordenId: string) {
  const db = createSupabaseServer();
  const { data, error } = await db
    .from("historial_estados")
    .select("*")
    .eq("orden_id", ordenId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getOrderPayments(ordenId: string) {
  const db = createSupabaseServer();
  const { data, error } = await db
    .from("pagos")
    .select("*")
    .eq("orden_id", ordenId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

export async function createOrder(formData: FormData) {
  const db = createSupabaseServer();

  let clienteId = formData.get("cliente_id") as string;

  if (!clienteId) {
    const { data: cliente, error: clienteError } = await db
      .from("clientes")
      .insert({
        nombre: formData.get("cliente_nombre") as string,
        telefono: formData.get("cliente_telefono") as string,
        dni: (formData.get("cliente_dni") as string) || null,
      })
      .select()
      .single();
    if (clienteError) throw clienteError;
    clienteId = cliente.id;
  }

  const presupuesto = formData.get("presupuesto");
  const sena = formData.get("sena");

  const { data: orden, error } = await db
    .from("ordenes_reparacion")
    .insert({
      cliente_id: clienteId,
      dispositivo: formData.get("dispositivo") as string,
      problema: formData.get("problema") as string,
      observaciones: (formData.get("observaciones") as string) || null,
      presupuesto: presupuesto ? Number(presupuesto) : null,
      sena: sena ? Number(sena) : null,
      fecha_entrega_estimada:
        (formData.get("fecha_entrega_estimada") as string) || null,
    })
    .select()
    .single();

  if (error) throw error;

  if (sena && Number(sena) > 0) {
    await db.from("pagos").insert({
      orden_id: orden.id,
      monto: Number(sena),
      tipo: "sena",
      metodo: (formData.get("metodo_sena") as string) || "efectivo",
    });
  }

  revalidatePath("/");
  revalidatePath("/ordenes");
  return orden;
}

export async function updateOrder(id: string, formData: FormData) {
  const db = createSupabaseServer();
  const presupuesto = formData.get("presupuesto");

  const { error } = await db
    .from("ordenes_reparacion")
    .update({
      dispositivo: formData.get("dispositivo") as string,
      problema: formData.get("problema") as string,
      observaciones: (formData.get("observaciones") as string) || null,
      presupuesto: presupuesto ? Number(presupuesto) : null,
      fecha_entrega_estimada:
        (formData.get("fecha_entrega_estimada") as string) || null,
    })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/ordenes");
  revalidatePath(`/ordenes/${id}`);
}

export async function cancelOrder(id: string) {
  const db = createSupabaseServer();
  const { error } = await db
    .from("ordenes_reparacion")
    .delete()
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/ordenes");
}

export async function updateOrderWarranty(id: string, garantia: string) {
  const db = createSupabaseServer();
  const { error } = await db
    .from("ordenes_reparacion")
    .update({ garantia })
    .eq("id", id);
  if (error) throw error;
  revalidatePath(`/ordenes/${id}`);
}

export async function updateOrderEstado(
  ordenId: string,
  estado: EstadoOrden
) {
  const db = createSupabaseServer();
  const { error } = await db
    .from("ordenes_reparacion")
    .update({ estado })
    .eq("id", ordenId);
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/ordenes");
  revalidatePath(`/ordenes/${ordenId}`);
}

export async function registerPayment(formData: FormData) {
  const db = createSupabaseServer();
  const ordenId = formData.get("orden_id") as string;
  const monto = Number(formData.get("monto"));
  const tipo = formData.get("tipo") as string;
  const metodo = formData.get("metodo") as string;
  const nota = (formData.get("nota") as string) || null;
  const marcarEntregado = formData.get("marcar_entregado") === "true";

  const { error } = await db.from("pagos").insert({
    orden_id: ordenId,
    monto,
    tipo,
    metodo,
    nota,
  });
  if (error) throw error;

  const updateData: Record<string, unknown> = {};
  if (tipo === "sena") {
    updateData.sena = monto;
  } else {
    updateData.pago_total = monto;
  }
  if (marcarEntregado) {
    updateData.estado = "entregado";
  }

  await db.from("ordenes_reparacion").update(updateData).eq("id", ordenId);

  revalidatePath("/");
  revalidatePath("/ordenes");
  revalidatePath(`/ordenes/${ordenId}`);
}

export async function exportOrders() {
  const db = createSupabaseServer();
  const { data, error } = await db
    .from("ordenes_reparacion")
    .select("*, cliente:clientes(nombre, telefono, dni)")
    .order("fecha_ingreso", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getDailyCash(fecha?: string) {
  const db = createSupabaseServer();
  const target = fecha || new Date().toISOString().split("T")[0];

  const { data, error } = await db
    .from("pagos")
    .select("*, orden:ordenes_reparacion(numero, dispositivo, cliente:clientes(nombre))")
    .gte("created_at", `${target}T00:00:00`)
    .lt("created_at", `${target}T23:59:59.999`)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getDashboardStats() {
  try {
    const db = createSupabaseServer();

    const [ordenes, hoy] = await Promise.all([
      db
        .from("ordenes_reparacion")
        .select("estado, presupuesto, sena, pago_total, fecha_ingreso"),
      new Date().toISOString().split("T")[0],
    ]);

    if (ordenes.error) throw ordenes.error;

    const data = ordenes.data || [];
    const activas = data.filter((o) => o.estado !== "entregado");
    const finalizadas = data.filter((o) => o.estado === "finalizado");
    const ingresadasHoy = data.filter(
      (o) => o.fecha_ingreso?.startsWith(hoy)
    );

    return {
      totalActivas: activas.length,
      finalizadasParaRetirar: finalizadas.length,
      ingresadasHoy: ingresadasHoy.length,
      totalHistorico: data.length,
    };
  } catch {
    return {
      totalActivas: 0,
      finalizadasParaRetirar: 0,
      ingresadasHoy: 0,
      totalHistorico: 0,
    };
  }
}
