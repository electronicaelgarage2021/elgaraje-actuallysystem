export const dynamic = "force-dynamic";

import { getDailyCash, getDailyVentas } from "@/lib/actions/orders";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Banknote, CreditCard, ArrowLeftRight, TrendingUp, ShoppingBag, Wrench } from "lucide-react";
import { CajaDatePicker } from "./caja-date-picker";

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

type Movimiento =
  | { type: "pago"; id: string; monto: number; metodo: string; created_at: string; tipo: string; orden: any }
  | { type: "venta"; id: string; monto: number; metodo: string; created_at: string; producto: string; nota: string | null };

export default async function CajaPage({
  searchParams,
}: {
  searchParams: Promise<{ fecha?: string }>;
}) {
  const params = await searchParams;
  const fecha = params.fecha || new Date().toISOString().split("T")[0];
  const [pagos, ventas] = await Promise.all([
    getDailyCash(fecha),
    getDailyVentas(fecha),
  ]);

  // Build unified movimientos list sorted chronologically
  const movimientos: Movimiento[] = [
    ...pagos.map((p: any) => ({ type: "pago" as const, id: p.id, monto: Number(p.monto), metodo: p.metodo, created_at: p.created_at, tipo: p.tipo, orden: p.orden })),
    ...ventas.map((v: any) => ({ type: "venta" as const, id: v.id, monto: Number(v.monto), metodo: v.metodo, created_at: v.created_at, producto: v.producto, nota: v.nota })),
  ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const totalDia = movimientos.reduce((sum, m) => sum + m.monto, 0);
  const totalPagos = pagos.reduce((sum: number, p: any) => sum + Number(p.monto), 0);
  const totalVentas = ventas.reduce((sum: number, v: any) => sum + Number(v.monto), 0);

  const porMetodo: Record<string, number> = {};
  for (const m of movimientos) {
    porMetodo[m.metodo] = (porMetodo[m.metodo] || 0) + m.monto;
  }

  const fechaDisplay = format(new Date(fecha + "T12:00:00"), "EEEE d 'de' MMMM, yyyy", { locale: es });

  return (
    <div className="fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Caja Diaria</h1>
          <p className="text-gray-400 text-sm mt-1 capitalize">{fechaDisplay}</p>
        </div>
        <CajaDatePicker currentDate={fecha} />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <div className="bg-surface-800 border border-surface-600 rounded-xl p-4 col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            Total del día
          </div>
          <p className="text-xl font-bold text-brand-teal">${totalDia.toLocaleString("es-AR")}</p>
          <p className="text-[0.65rem] text-gray-500">{movimientos.length} movimiento{movimientos.length !== 1 ? "s" : ""}</p>
          {pagos.length > 0 && ventas.length > 0 && (
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[0.6rem] text-gray-500 flex items-center gap-1">
                <Wrench className="w-2.5 h-2.5" />${totalPagos.toLocaleString("es-AR")}
              </span>
              <span className="text-[0.6rem] text-gray-500 flex items-center gap-1">
                <ShoppingBag className="w-2.5 h-2.5" />${totalVentas.toLocaleString("es-AR")}
              </span>
            </div>
          )}
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
              <p className="text-lg font-bold">${monto.toLocaleString("es-AR")}</p>
            </div>
          );
        })}
      </div>

      {/* Transactions list */}
      <div className="bg-surface-800 border border-surface-600 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-surface-600">
          <h2 className="text-sm font-semibold">Movimientos</h2>
        </div>
        {movimientos.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-sm">
            No hay movimientos para este día
          </div>
        ) : (
          <div className="divide-y divide-surface-700">
            {movimientos.map((mov) => {
              const config = METODO_ICONS[mov.metodo] || METODO_ICONS.efectivo;

              if (mov.type === "venta") {
                return (
                  <div key={`venta-${mov.id}`} className="px-5 py-3 flex items-center justify-between card-hover">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-amber-400 bg-surface-700">
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          <span className="text-amber-400/80 text-[0.65rem] font-semibold uppercase tracking-wide mr-1.5">Venta</span>
                          {mov.producto}
                        </p>
                        <p className="text-xs text-gray-500">
                          {METODO_LABELS[mov.metodo] || mov.metodo}
                          {mov.nota ? ` · ${mov.nota}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-brand-teal">
                        +${mov.monto.toLocaleString("es-AR")}
                      </p>
                      <p className="text-[0.65rem] text-gray-500">
                        {format(new Date(mov.created_at), "HH:mm", { locale: es })}
                      </p>
                    </div>
                  </div>
                );
              }

              // Pago (repair payment)
              const Icon = config.icon;
              return (
                <div key={`pago-${mov.id}`} className="px-5 py-3 flex items-center justify-between card-hover">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.color} bg-surface-700`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {mov.tipo === "sena" ? "Seña" : "Pago"} — Orden #{mov.orden?.numero}
                      </p>
                      <p className="text-xs text-gray-500">
                        {mov.orden?.cliente?.nombre} · {mov.orden?.dispositivo}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-brand-teal">
                      +${mov.monto.toLocaleString("es-AR")}
                    </p>
                    <p className="text-[0.65rem] text-gray-500">
                      {format(new Date(mov.created_at), "HH:mm", { locale: es })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
