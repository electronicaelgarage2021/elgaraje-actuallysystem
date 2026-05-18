"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteVenta } from "@/lib/actions/ventas";
import { Trash2, Banknote, ArrowLeftRight, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

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

interface Venta {
  id: string;
  producto: string;
  monto: number;
  metodo: string;
  nota: string | null;
  created_at: string;
}

export function VentasList({ ventas, isRange = false }: { ventas: Venta[]; isRange?: boolean }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await deleteVenta(id);
      router.refresh();
    } catch {
      // silently fail
    } finally {
      setDeletingId(null);
    }
  }

  if (ventas.length === 0) {
    return (
      <div className="bg-surface-800 border border-surface-600 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-surface-600">
          <h2 className="text-sm font-semibold">{isRange ? "Ventas del período" : "Ventas del día"}</h2>
        </div>
        <div className="p-12 text-center text-gray-500 text-sm">
          No hay ventas registradas para {isRange ? "este período" : "este día"}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-800 border border-surface-600 rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-surface-600">
        <h2 className="text-sm font-semibold">{isRange ? "Ventas del período" : "Ventas del día"}</h2>
      </div>
      <div className="divide-y divide-surface-700">
        {ventas.map((venta) => {
          const config = METODO_ICONS[venta.metodo] || METODO_ICONS.efectivo;
          const Icon = config.icon;
          return (
            <div key={venta.id} className="px-5 py-3 flex items-center justify-between card-hover">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.color} bg-surface-700`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{venta.producto}</p>
                  <p className="text-xs text-gray-500">
                    {METODO_LABELS[venta.metodo] || venta.metodo}
                    {venta.nota ? ` · ${venta.nota}` : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-bold text-green-400">
                    +${Number(venta.monto).toLocaleString("es-AR")}
                  </p>
                  <p className="text-[0.65rem] text-gray-500">
                    {isRange
                      ? format(new Date(venta.created_at), "d MMM, HH:mm", { locale: es })
                      : format(new Date(venta.created_at), "HH:mm", { locale: es })}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(venta.id)}
                  disabled={deletingId === venta.id}
                  className="p-2 rounded-lg text-gray-500 hover:text-brand-red hover:bg-brand-red/10 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
