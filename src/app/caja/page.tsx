export const dynamic = "force-dynamic";

import { getDailyCash } from "@/lib/actions/orders";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DollarSign, Banknote, CreditCard, ArrowLeftRight, TrendingUp } from "lucide-react";
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

export default async function CajaPage({
  searchParams,
}: {
  searchParams: Promise<{ fecha?: string }>;
}) {
  const params = await searchParams;
  const fecha = params.fecha || new Date().toISOString().split("T")[0];
  const pagos = await getDailyCash(fecha);

  const totalDia = pagos.reduce((sum: number, p: any) => sum + Number(p.monto), 0);

  const porMetodo: Record<string, number> = {};
  for (const p of pagos) {
    porMetodo[p.metodo] = (porMetodo[p.metodo] || 0) + Number(p.monto);
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
          <p className="text-[0.65rem] text-gray-500">{pagos.length} movimiento{pagos.length !== 1 ? "s" : ""}</p>
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
        {pagos.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-sm">
            No hay movimientos para este día
          </div>
        ) : (
          <div className="divide-y divide-surface-700">
            {pagos.map((pago: any) => {
              const config = METODO_ICONS[pago.metodo] || METODO_ICONS.efectivo;
              const Icon = config.icon;
              return (
                <div key={pago.id} className="px-5 py-3 flex items-center justify-between card-hover">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.color} bg-surface-700`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {pago.tipo === "sena" ? "Seña" : "Pago"} — Orden #{pago.orden?.numero}
                      </p>
                      <p className="text-xs text-gray-500">
                        {pago.orden?.cliente?.nombre} · {pago.orden?.dispositivo}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-brand-teal">
                      +${Number(pago.monto).toLocaleString("es-AR")}
                    </p>
                    <p className="text-[0.65rem] text-gray-500">
                      {format(new Date(pago.created_at), "HH:mm", { locale: es })}
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
