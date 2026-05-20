export const dynamic = "force-dynamic";

import { getDailyCash, getDailyVentas } from "@/lib/actions/orders";
import { getDailyGastos } from "@/lib/actions/gastos";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Banknote, CreditCard, ArrowLeftRight, TrendingUp, ShoppingBag, Wrench, Receipt } from "lucide-react";
import { CajaDatePicker } from "./caja-date-picker";
import { CajaMovimientos, type Movimiento } from "./caja-movimientos";
import { CajaGastosForm } from "./caja-gastos-form";

const METODO_ICONS: Record<string, { icon: typeof Banknote; color: string }> = {
  efectivo: { icon: Banknote, color: "text-green-400" },
  transferencia: { icon: ArrowLeftRight, color: "text-blue-400" },
  debito: { icon: CreditCard, color: "text-purple-400" },
  credito: { icon: CreditCard, color: "text-orange-400" },
};

const METODO_LABELS: Record<string, string> = {
  efectivo: "Efectivo",
  transferencia: "Transferencia",
  debito: "Débito",
  credito: "Crédito",
};

function formatDateRange(desde: string, hasta: string): string {
  const dDesde = new Date(desde + "T12:00:00");
  const dHasta = new Date(hasta + "T12:00:00");

  if (desde === hasta) {
    return format(dDesde, "EEEE d 'de' MMMM, yyyy", { locale: es });
  }

  const sameYear = dDesde.getFullYear() === dHasta.getFullYear();
  const sameMonth = sameYear && dDesde.getMonth() === dHasta.getMonth();

  if (sameMonth) {
    return `${format(dDesde, "d", { locale: es })} - ${format(dHasta, "d 'de' MMMM, yyyy", { locale: es })}`;
  }

  if (sameYear) {
    return `${format(dDesde, "d MMM", { locale: es })} - ${format(dHasta, "d MMM, yyyy", { locale: es })}`;
  }

  return `${format(dDesde, "d MMM yyyy", { locale: es })} - ${format(dHasta, "d MMM yyyy", { locale: es })}`;
}

export default async function CajaPage({
  searchParams,
}: {
  searchParams: Promise<{ fecha?: string; desde?: string; hasta?: string; periodo?: string }>;
}) {
  const params = await searchParams;

  const today = new Date().toISOString().split("T")[0];
  const desde = params.desde || params.fecha || today;
  const hasta = params.hasta || params.fecha || today;

  const [pagos, ventas, gastos] = await Promise.all([
    getDailyCash(desde, hasta),
    getDailyVentas(desde, hasta),
    getDailyGastos(desde, hasta),
  ]);

  const movimientos: Movimiento[] = [
    ...pagos.map((p: any) => ({ type: "pago" as const, id: p.id, monto: Number(p.monto), metodo: p.metodo, created_at: p.created_at, tipo: p.tipo, orden: p.orden })),
    ...ventas.map((v: any) => ({ type: "venta" as const, id: v.id, monto: Number(v.monto), metodo: v.metodo, created_at: v.created_at, producto: v.producto, nota: v.nota })),
    ...gastos.map((g: any) => ({ type: "gasto" as const, id: g.id, monto: Number(g.monto), metodo: g.metodo, created_at: g.created_at, descripcion: g.descripcion, categoria: g.categoria })),
  ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const totalGastos = gastos.reduce((sum: number, g: any) => sum + Number(g.monto), 0);
  const totalPagos = pagos.reduce((sum: number, p: any) => sum + Number(p.monto), 0);
  const totalVentas = ventas.reduce((sum: number, v: any) => sum + Number(v.monto), 0);
  const totalDia = totalPagos + totalVentas - totalGastos;

  const porMetodo: Record<string, number> = {};
  for (const m of movimientos) {
    const sign = m.type === "gasto" ? -1 : 1;
    porMetodo[m.metodo] = (porMetodo[m.metodo] || 0) + m.monto * sign;
  }

  const isRange = desde !== hasta;
  const fechaDisplay = formatDateRange(desde, hasta);
  const periodLabel = isRange ? "Total del período" : "Total del día";

  return (
    <div className="fade-in">
      <div className="flex flex-col md:flex-row md:items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Caja Diaria</h1>
          <p className="text-gray-400 text-sm mt-1 capitalize">{fechaDisplay}</p>
        </div>
        <CajaDatePicker desde={desde} hasta={hasta} periodo={params.periodo} />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <div className="bg-surface-800 border border-surface-600 rounded-xl p-4 col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            {periodLabel}
          </div>
          <p className={`text-xl font-bold ${totalDia >= 0 ? "text-green-400" : "text-red-400"}`}>
            {totalDia < 0 ? "-" : ""}${Math.abs(totalDia).toLocaleString("es-AR")}
          </p>
          <p className="text-[0.65rem] text-gray-500">{movimientos.length} movimiento{movimientos.length !== 1 ? "s" : ""}</p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {totalPagos > 0 && (
              <span className="text-[0.6rem] text-gray-500 flex items-center gap-1">
                <Wrench className="w-2.5 h-2.5" />${totalPagos.toLocaleString("es-AR")}
              </span>
            )}
            {totalVentas > 0 && (
              <span className="text-[0.6rem] text-gray-500 flex items-center gap-1">
                <ShoppingBag className="w-2.5 h-2.5" />${totalVentas.toLocaleString("es-AR")}
              </span>
            )}
            {totalGastos > 0 && (
              <span className="text-[0.6rem] text-red-400/60 flex items-center gap-1">
                <Receipt className="w-2.5 h-2.5" />-${totalGastos.toLocaleString("es-AR")}
              </span>
            )}
          </div>
        </div>

        {Object.entries(METODO_LABELS).map(([key, label]) => {
          const monto = porMetodo[key] || 0;
          const config = METODO_ICONS[key];
          const Icon = config.icon;
          return (
            <div key={key} className="bg-surface-800 border border-surface-600 rounded-xl p-4">
              <div className={`flex items-center gap-2 text-xs mb-1 ${config.color}`}>
                <Icon className="w-3.5 h-3.5" />
                {label}
              </div>
              <p className={`text-lg font-bold ${monto < 0 ? "text-red-400" : ""}`}>
                {monto < 0 ? "-" : ""}${Math.abs(monto).toLocaleString("es-AR")}
              </p>
            </div>
          );
        })}
      </div>

      {/* Gastos form */}
      <div className="mb-4">
        <CajaGastosForm />
      </div>

      {/* Transactions list with filters */}
      <CajaMovimientos movimientos={movimientos} isRange={isRange} />
    </div>
  );
}
