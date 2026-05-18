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
      prioridad: formData.get("prioridad") === "true",
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

  const repuesto = formData.get("repuesto") as string;
  if (repuesto && repuesto.trim()) {
    const { createRepuesto } = await import("./repuestos");
    await createRepuesto(repuesto.trim(), orden.id);
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

export async function deletePayment(paymentId: string, ordenId: string) {
  const db = createSupabaseServer();

  // Get the payment first to know its type and amount
  const { data: pago, error: fetchError } = await db
    .from("pagos")
    .select("*")
    .eq("id", paymentId)
    .single();
  if (fetchError) throw fetchError;

  // Delete the payment
  const { error } = await db.from("pagos").delete().eq("id", paymentId);
  if (error) throw error;

  // If it was a seña, reset the order's sena field to null
  if (pago.tipo === "sena") {
    await db.from("ordenes_reparacion").update({ sena: null }).eq("id", ordenId);
  }
  // If it was a pago_final, reset pago_total to null
  if (pago.tipo === "pago_final") {
    await db.from("ordenes_reparacion").update({ pago_total: null }).eq("id", ordenId);
  }

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

export async function getDailyCash(fecha?: string, fechaHasta?: string) {
  const db = createSupabaseServer();
  const desde = fecha || new Date().toISOString().split("T")[0];
  const hasta = fechaHasta || desde;

  const { data, error } = await db
    .from("pagos")
    .select("*, orden:ordenes_reparacion(numero, dispositivo, cliente:clientes(nombre))")
    .gte("created_at", `${desde}T00:00:00`)
    .lt("created_at", `${hasta}T23:59:59.999`)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getDailyVentas(fecha?: string, fechaHasta?: string) {
  const db = createSupabaseServer();
  const desde = fecha || new Date().toISOString().split("T")[0];
  const hasta = fechaHasta || desde;

  const { data, error } = await db
    .from("ventas")
    .select("*")
    .gte("created_at", `${desde}T00:00:00`)
    .lt("created_at", `${hasta}T23:59:59.999`)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getDeviceHistory(dispositivo: string) {
  const db = createSupabaseServer();
  const searchTerm = dispositivo.trim();
  if (searchTerm.length < 3) return { count: 0, problemas: [] as { problema: string; count: number }[], avgPresupuesto: null };

  const { data, error } = await db
    .from("ordenes_reparacion")
    .select("problema, presupuesto")
    .ilike("dispositivo", `%${searchTerm}%`);

  if (error || !data || data.length === 0) return { count: 0, problemas: [] as { problema: string; count: number }[], avgPresupuesto: null };

  const freq: Record<string, number> = {};
  let avgPresupuesto = 0;
  let presCount = 0;
  for (const o of data) {
    const prob = o.problema?.toLowerCase().trim();
    if (prob) freq[prob] = (freq[prob] || 0) + 1;
    if (o.presupuesto) {
      avgPresupuesto += Number(o.presupuesto);
      presCount++;
    }
  }

  const problemas = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([problema, count]) => ({ problema, count }));

  return {
    count: data.length,
    problemas,
    avgPresupuesto: presCount > 0 ? Math.round(avgPresupuesto / presCount) : null,
  };
}

export async function getMonthlyStats() {
  try {
    const db = createSupabaseServer();
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7); // "2026-05"
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 7);

    // Current month orders
    const { data: currentOrders } = await db
      .from("ordenes_reparacion")
      .select("presupuesto, pago_total, sena, fecha_ingreso, estado")
      .gte("fecha_ingreso", `${currentMonth}-01`)
      .lt("fecha_ingreso", `${currentMonth}-32`);

    // Previous month orders
    const { data: prevOrders } = await db
      .from("ordenes_reparacion")
      .select("presupuesto, pago_total, sena, fecha_ingreso, estado")
      .gte("fecha_ingreso", `${prevMonth}-01`)
      .lt("fecha_ingreso", `${prevMonth}-32`);

    // Current month payments
    const { data: currentPayments } = await db
      .from("pagos")
      .select("monto, created_at")
      .gte("created_at", `${currentMonth}-01`)
      .lt("created_at", `${currentMonth}-32`);

    // Previous month payments
    const { data: prevPayments } = await db
      .from("pagos")
      .select("monto, created_at")
      .gte("created_at", `${prevMonth}-01`)
      .lt("created_at", `${prevMonth}-32`);

    // Current month sales (ventas)
    const { data: currentSales } = await db
      .from("ventas")
      .select("monto, created_at")
      .gte("created_at", `${currentMonth}-01`)
      .lt("created_at", `${currentMonth}-32`);

    const { data: prevSales } = await db
      .from("ventas")
      .select("monto, created_at")
      .gte("created_at", `${prevMonth}-01`)
      .lt("created_at", `${prevMonth}-32`);

    const curr = currentOrders || [];
    const prev = prevOrders || [];
    const currPay = currentPayments || [];
    const prevPay = prevPayments || [];
    const currSales = currentSales || [];
    const pSales = prevSales || [];

    const currentRevenue = currPay.reduce((s, p) => s + Number(p.monto), 0) + currSales.reduce((s, v) => s + Number(v.monto), 0);
    const prevRevenue = prevPay.reduce((s, p) => s + Number(p.monto), 0) + pSales.reduce((s, v) => s + Number(v.monto), 0);

    const currentTicket = curr.length > 0
      ? curr.reduce((s, o) => s + (Number(o.presupuesto) || 0), 0) / curr.length
      : 0;

    // Weekly breakdown for current month (simple: group by week number)
    const weeks: number[] = [0, 0, 0, 0, 0];
    for (const p of currPay) {
      const day = new Date(p.created_at).getDate();
      const week = Math.min(Math.floor((day - 1) / 7), 4);
      weeks[week] += Number(p.monto);
    }
    for (const v of currSales) {
      const day = new Date(v.created_at).getDate();
      const week = Math.min(Math.floor((day - 1) / 7), 4);
      weeks[week] += Number(v.monto);
    }

    return {
      reparaciones: curr.length,
      reparacionesPrev: prev.length,
      ingresos: currentRevenue,
      ingresosPrev: prevRevenue,
      ticketPromedio: Math.round(currentTicket),
      entregadas: curr.filter(o => o.estado === "entregado").length,
      ventasProductos: currSales.length,
      semanas: weeks,
    };
  } catch {
    return {
      reparaciones: 0, reparacionesPrev: 0,
      ingresos: 0, ingresosPrev: 0,
      ticketPromedio: 0, entregadas: 0,
      ventasProductos: 0, semanas: [0, 0, 0, 0, 0],
    };
  }
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
