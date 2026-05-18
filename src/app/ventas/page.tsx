export const dynamic = "force-dynamic";

import { getVentas, getVentasStats } from "@/lib/actions/ventas";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ShoppingBag, TrendingUp, Banknote, ArrowLeftRight, CreditCard } from "lucide-react";
import { VentasDatePicker } from "./ventas-date-picker";
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

export default async function VentasPage({
  searchParams,
}: {
  searchParams: Promise<{ fecha?: string }>;
}) {
  const params = await searchParams;
  const fecha = params.fecha || new Date().toISOString().split("T")[0];
  const [ventas, stats] = await Promise.all([
    getVentas(fecha),
    getVentasStats(fecha),
  ]);

  const fechaDisplay = format(new Date(fecha + "T12:00:00"), "EEEE d 'de' MMMM, yyyy", { locale: es });

  return (
    <div className="fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-brand-teal" />
            Ventas del dia
          </h1>
          <p className="text-gray-400 text-sm mt-1 capitalize">{fechaDisplay}</p>
        </div>
        <VentasDatePicker currentDate={fecha} />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <div className="bg-surface-800 border border-surface-600 rounded-xl p-4 col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            Total vendido
          </div>
          <p className="text-xl font-bold text-brand-teal">${stats.total.toLocaleString("es-AR")}</p>
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
      <VentasList ventas={ventas} />
    </div>
  );
}
