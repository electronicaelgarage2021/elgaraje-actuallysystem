"use server";

import { createSupabaseServer } from "@/lib/supabase/server";

export async function getDaySummary(fecha: string) {
  const db = createSupabaseServer();

  // Orders received on this date
  const { data: ingresadas } = await db
    .from("ordenes_reparacion")
    .select("id, numero, dispositivo, problema, estado, presupuesto, cliente:clientes(nombre)")
    .gte("fecha_ingreso", `${fecha}T00:00:00`)
    .lt("fecha_ingreso", `${fecha}T23:59:59.999`);

  // Orders delivered on this date
  const { data: entregadas } = await db
    .from("ordenes_reparacion")
    .select("id, numero, dispositivo, presupuesto, cliente:clientes(nombre)")
    .gte("fecha_entregado", `${fecha}T00:00:00`)
    .lt("fecha_entregado", `${fecha}T23:59:59.999`);

  // Payments on this date
  const { data: pagos } = await db
    .from("pagos")
    .select("id, monto, tipo, metodo, orden:ordenes_reparacion(numero, dispositivo)")
    .gte("created_at", `${fecha}T00:00:00`)
    .lt("created_at", `${fecha}T23:59:59.999`);

  // Sales on this date
  const { data: ventas } = await db
    .from("ventas")
    .select("id, producto, monto, metodo")
    .gte("created_at", `${fecha}T00:00:00`)
    .lt("created_at", `${fecha}T23:59:59.999`);

  // Repuestos requested on this date
  const { data: repuestos } = await db
    .from("repuestos")
    .select("id, nombre, proveedor, orden:ordenes_reparacion(numero, dispositivo)")
    .gte("created_at", `${fecha}T00:00:00`)
    .lt("created_at", `${fecha}T23:59:59.999`);

  const totalPagos = (pagos || []).reduce((s: number, p: any) => s + Number(p.monto), 0);
  const totalVentas = (ventas || []).reduce((s: number, v: any) => s + Number(v.monto), 0);

  return {
    ingresadas: ingresadas || [],
    entregadas: entregadas || [],
    pagos: pagos || [],
    ventas: ventas || [],
    repuestos: repuestos || [],
    totalCaja: totalPagos + totalVentas,
    totalPagos,
    totalVentas,
  };
}
