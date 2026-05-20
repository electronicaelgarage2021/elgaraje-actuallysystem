"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Banknote, CreditCard, ArrowLeftRight, ShoppingBag, Wrench, Package, Receipt } from "lucide-react";

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

export type Movimiento =
  | { type: "pago"; id: string; monto: number; metodo: string; created_at: string; tipo: string; orden: any }
  | { type: "venta"; id: string; monto: number; metodo: string; created_at: string; producto: string; nota: string | null }
  | { type: "gasto"; id: string; monto: number; metodo: string; created_at: string; descripcion: string; categoria: string };

type FilterType = "todos" | "reparaciones" | "ventas" | "gastos" | "repuestos";

const FILTERS: { key: FilterType; label: string; icon: typeof Wrench }[] = [
  { key: "todos", label: "Todos", icon: Receipt },
  { key: "reparaciones", label: "Reparaciones", icon: Wrench },
  { key: "ventas", label: "Ventas", icon: ShoppingBag },
  { key: "gastos", label: "Gastos", icon: Banknote },
  { key: "repuestos", label: "Repuestos", icon: Package },
];

function matchesFilter(mov: Movimiento, filter: FilterType): boolean {
  if (filter === "todos") return true;
  if (filter === "reparaciones") return mov.type === "pago" && mov.tipo !== "repuesto";
  if (filter === "ventas") return mov.type === "venta";
  if (filter === "gastos") return mov.type === "gasto";
  if (filter === "repuestos") return mov.type === "pago" && mov.tipo === "repuesto";
  return true;
}

export function CajaMovimientos({
  movimientos,
  isRange,
}: {
  movimientos: Movimiento[];
  isRange: boolean;
}) {
  const [filter, setFilter] = useState<FilterType>("todos");

  const filtered = movimientos.filter((m) => matchesFilter(m, filter));

  return (
    <div className="bg-surface-800 border border-surface-600 rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-surface-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">Movimientos</h2>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-2.5 py-1 rounded-full text-[0.65rem] font-medium transition-colors flex items-center gap-1 ${
                filter === key
                  ? "bg-brand-teal/15 text-brand-teal border border-brand-teal/30"
                  : "bg-surface-700 text-gray-400 hover:bg-surface-600"
              }`}
            >
              <Icon className="w-3 h-3" />
              {label}
            </button>
          ))}
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="p-12 text-center text-gray-500 text-sm">
          No hay movimientos{filter !== "todos" ? ` de ${FILTERS.find((f) => f.key === filter)?.label.toLowerCase()}` : ""}{" "}
          para {isRange ? "este período" : "este día"}
        </div>
      ) : (
        <div className="divide-y divide-surface-700">
          {filtered.map((mov) => {
            const config = METODO_ICONS[mov.metodo] || METODO_ICONS.efectivo;

            if (mov.type === "gasto") {
              return (
                <div key={`gasto-${mov.id}`} className="px-5 py-3 flex items-center justify-between card-hover">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 bg-surface-700">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        <span className="text-red-400/80 text-[0.65rem] font-semibold uppercase tracking-wide mr-1.5">Gasto</span>
                        {mov.descripcion}
                      </p>
                      <p className="text-xs text-gray-500">
                        {METODO_LABELS[mov.metodo] || mov.metodo}
                        {mov.categoria !== "otro" ? ` · ${mov.categoria}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-400">
                      -${mov.monto.toLocaleString("es-AR")}
                    </p>
                    <p className="text-[0.65rem] text-gray-500">
                      {isRange
                        ? format(new Date(mov.created_at), "d MMM, HH:mm", { locale: es })
                        : format(new Date(mov.created_at), "HH:mm", { locale: es })}
                    </p>
                  </div>
                </div>
              );
            }

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
                    <p className="text-sm font-bold text-green-400">
                      +${mov.monto.toLocaleString("es-AR")}
                    </p>
                    <p className="text-[0.65rem] text-gray-500">
                      {isRange
                        ? format(new Date(mov.created_at), "d MMM, HH:mm", { locale: es })
                        : format(new Date(mov.created_at), "HH:mm", { locale: es })}
                    </p>
                  </div>
                </div>
              );
            }

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
                  <p className="text-sm font-bold text-green-400">
                    +${mov.monto.toLocaleString("es-AR")}
                  </p>
                  <p className="text-[0.65rem] text-gray-500">
                    {isRange
                      ? format(new Date(mov.created_at), "d MMM, HH:mm", { locale: es })
                      : format(new Date(mov.created_at), "HH:mm", { locale: es })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
