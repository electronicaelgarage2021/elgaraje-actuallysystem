"use server";

import { createSupabaseServer } from "@/lib/supabase/server";

export type MonthActivity = Record<
  string,
  {
    ingresados: boolean;
    entregados: boolean;
    cobros: boolean;
    ventas: boolean;
    repuestos: boolean;
  }
>;

export async function getMonthActivity(
  year: number,
  month: number
): Promise<MonthActivity> {
  const db = createSupabaseServer();

  const startDate = `${year}-${String(month).padStart(2, "0")}-01T00:00:00`;
  const endMonth = month === 12 ? 1 : month + 1;
  const endYear = month === 12 ? year + 1 : year;
  const endDate = `${endYear}-${String(endMonth).padStart(2, "0")}-01T00:00:00`;

  const [ingresados, entregados, cobros, ventas, repuestos] = await Promise.all(
    [
      db
        .from("ordenes_reparacion")
        .select("fecha_ingreso")
        .gte("fecha_ingreso", startDate)
        .lt("fecha_ingreso", endDate)
        .not("fecha_ingreso", "is", null),
      db
        .from("ordenes_reparacion")
        .select("fecha_entregado")
        .gte("fecha_entregado", startDate)
        .lt("fecha_entregado", endDate)
        .not("fecha_entregado", "is", null),
      db
        .from("pagos")
        .select("created_at")
        .gte("created_at", startDate)
        .lt("created_at", endDate),
      db
        .from("ventas")
        .select("created_at")
        .gte("created_at", startDate)
        .lt("created_at", endDate),
      db
        .from("repuestos")
        .select("created_at")
        .gte("created_at", startDate)
        .lt("created_at", endDate),
    ]
  );

  const activity: MonthActivity = {};

  const ensureDay = (dateStr: string) => {
    const day = dateStr.split("T")[0];
    if (!activity[day]) {
      activity[day] = {
        ingresados: false,
        entregados: false,
        cobros: false,
        ventas: false,
        repuestos: false,
      };
    }
    return day;
  };

  for (const row of ingresados.data || []) {
    const day = ensureDay(row.fecha_ingreso);
    activity[day].ingresados = true;
  }
  for (const row of entregados.data || []) {
    const day = ensureDay(row.fecha_entregado);
    activity[day].entregados = true;
  }
  for (const row of cobros.data || []) {
    const day = ensureDay(row.created_at);
    activity[day].cobros = true;
  }
  for (const row of ventas.data || []) {
    const day = ensureDay(row.created_at);
    activity[day].ventas = true;
  }
  for (const row of repuestos.data || []) {
    const day = ensureDay(row.created_at);
    activity[day].repuestos = true;
  }

  return activity;
}

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
