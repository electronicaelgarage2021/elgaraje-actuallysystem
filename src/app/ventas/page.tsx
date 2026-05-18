export const dynamic = "force-dynamic";

import { getVentas, getVentasStats } from "@/lib/actions/ventas";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ShoppingBag, TrendingUp, Banknote, ArrowLeftRight, CreditCard } from "lucide-react";
import { VentasRangePicker } from "./ventas-range-picker";
import { VentasForm } from "./ventas-form";
import { VentasList } from "./ventas-list";

const METODO_ICONS: Record<string, { icon: typeof Banknote; color: string }> = {
  efectivo: { icon: Banknote, color: "text-green-400" },
  transferencia: { icon: ArrowLeftRight, color: "text-blue-400" },
  debito: { icon: CreditCard, color: "text-purple-400" },
  credito: { icon: CreditCard, color: "text-orange-400" },
};

const METODO_LABELS: Record<string, string> = {
  efectivo: "Efectivo",
  transferencia: "Transferencia",
  debito: "Debito",
  credito: "Credito",
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

export default async function VentasPage({
  searchParams,
}: {
  searchParams: Promise<{ fecha?: string; desde?: string; hasta?: string }>;
}) {
  const params = await searchParams;

  // Backward compat: ?fecha=X treats as single day
  const today = new Date().toISOString().split("T")[0];
  const desde = params.desde || params.fecha || today;
  const hasta = params.hasta || params.fecha || today;

  const [ventas, stats] = await Promise.all([
    getVentas(desde, hasta),
    getVentasStats(desde, hasta),
  ]);

  const isRange = desde !== hasta;
  const fechaDisplay = formatDateRange(desde, hasta);
  const periodLabel = isRange ? "Total del período" : "Total del día";

  return (
    <div className="fade-in">
      <div className="flex flex-col md:flex-row md:items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-brand-teal" />
            Ventas
          </h1>
          <p className="text-gray-400 text-sm mt-1 capitalize">{fechaDisplay}</p>
        </div>
        <VentasRangePicker desde={desde} hasta={hasta} />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <div className="bg-surface-800 border border-surface-600 rounded-xl p-4 col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            {periodLabel}
          </div>
          <p className="text-xl font-bold text-green-400">${stats.total.toLocaleString("es-AR")}</p>
          <p className="text-[0.65rem] text-gray-500">{stats.cantidad} venta{stats.cantidad !== 1 ? "s" : ""}</p>
        </div>

        {Object.entries(METODO_LABELS).map(([key, label]) => {
          const monto = stats.porMetodo[key] || 0;
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

      {/* New sale form */}
      <div className="mb-6">
        <VentasForm />
      </div>

      {/* Sales list */}
      <VentasList ventas={ventas} isRange={isRange} />
    </div>
  );
}
