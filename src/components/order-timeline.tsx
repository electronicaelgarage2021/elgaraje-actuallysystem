"use client";

import { ESTADOS, getEstadoIndex } from "@/lib/constants";
import type { EstadoOrden, HistorialEstado } from "@/lib/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Check } from "lucide-react";

const STATE_COLORS: Record<number, { bg: string; text: string; ring: string }> = {
  0: { bg: "bg-blue-500", text: "text-blue-400", ring: "ring-blue-500/20" },
  1: { bg: "bg-purple-500", text: "text-purple-400", ring: "ring-purple-500/20" },
  2: { bg: "bg-yellow-500", text: "text-yellow-400", ring: "ring-yellow-500/20" },
  3: { bg: "bg-green-500", text: "text-green-400", ring: "ring-green-500/20" },
  4: { bg: "bg-gray-400", text: "text-gray-300", ring: "ring-gray-400/20" },
};

interface OrderTimelineProps {
  estadoActual: EstadoOrden;
  historial?: HistorialEstado[];
}

export function OrderTimeline({
  estadoActual,
  historial,
}: OrderTimelineProps) {
  const currentIndex = getEstadoIndex(estadoActual);

  function getFechaEstado(estado: EstadoOrden) {
    if (!historial) return null;
    const entry = historial.find((h) => h.estado === estado);
    return entry
      ? format(new Date(entry.created_at), "dd/MM HH:mm", { locale: es })
      : null;
  }

  return (
    <div className="flex items-start justify-between overflow-x-auto pb-2">
      {ESTADOS.map((estado, index) => {
        const isPast = index < currentIndex;
        const isCurrent = index === currentIndex;
        const fecha = getFechaEstado(estado.value);
        const colors = STATE_COLORS[index];

        return (
          <div key={estado.value} className="flex items-start flex-1">
            <div className="flex flex-col items-center">
              {isPast ? (
                <div className="w-8 h-8 rounded-full bg-brand-teal flex items-center justify-center">
                  <Check className="w-4 h-4 text-surface-900" strokeWidth={2.5} />
                </div>
              ) : isCurrent ? (
                <div className={`w-8 h-8 rounded-full ${colors.bg} flex items-center justify-center ring-4 ${colors.ring}`}>
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-surface-600 flex items-center justify-center">
                  <div className="w-2 h-2 bg-gray-500 rounded-full" />
                </div>
              )}
              <span
                className={`text-[10px] mt-1.5 text-center leading-tight max-w-16 ${
                  isPast
                    ? "text-brand-teal font-medium"
                    : isCurrent
                      ? `${colors.text} font-semibold`
                      : "text-gray-500"
                }`}
              >
                {estado.label}
              </span>
              {fecha && (
                <span className="text-[9px] text-gray-500 mt-0.5">{fecha}</span>
              )}
            </div>
            {index < ESTADOS.length - 1 && (
              <div
                className={`h-0.5 flex-1 mt-4 mx-2 rounded ${
                  index < currentIndex ? "bg-brand-teal" : "bg-surface-600"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
