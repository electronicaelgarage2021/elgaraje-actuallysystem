"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Banknote, CreditCard, ArrowLeftRight } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const METODO_CONFIG: Record<string, { icon: typeof Banknote; label: string; color: string }> = {
  efectivo: { icon: Banknote, label: "Efectivo", color: "text-green-400" },
  transferencia: { icon: ArrowLeftRight, label: "Transferencia", color: "text-blue-400" },
  debito: { icon: CreditCard, label: "Débito", color: "text-purple-400" },
  credito: { icon: CreditCard, label: "Crédito", color: "text-orange-400" },
};

interface Pago {
  id: string;
  monto: number;
  tipo: string;
  metodo: string;
  nota: string | null;
  created_at: string;
}

export function PaymentHistory({ pagos }: { pagos: Pago[] }) {
  const [open, setOpen] = useState(false);

  if (pagos.length === 0) return null;

  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors"
      >
        {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        Historial de pagos ({pagos.length})
      </button>

      {open && (
        <div className="mt-2 space-y-1.5">
          {pagos.map((pago) => {
            const config = METODO_CONFIG[pago.metodo] || METODO_CONFIG.efectivo;
            const Icon = config.icon;
            return (
              <div key={pago.id} className="flex items-center justify-between bg-surface-700/50 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <Icon className={`w-3.5 h-3.5 ${config.color}`} />
                  <div>
                    <span className="text-xs font-medium">
                      {pago.tipo === "sena" ? "Seña" : "Pago final"}
                    </span>
                    <span className="text-[0.65rem] text-gray-500 ml-2">{config.label}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-brand-teal">
                    ${Number(pago.monto).toLocaleString("es-AR")}
                  </span>
                  <span className="text-[0.6rem] text-gray-600 ml-2">
                    {format(new Date(pago.created_at), "dd/MM HH:mm", { locale: es })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
