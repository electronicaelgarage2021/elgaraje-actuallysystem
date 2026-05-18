"use client";

import { useState, useEffect } from "react";
import { getDeviceHistory } from "@/lib/actions/orders";
import { History } from "lucide-react";

export function DeviceHistoryHint({ dispositivo }: { dispositivo: string }) {
  const [data, setData] = useState<{
    count: number;
    problemas: { problema: string; count: number }[];
    avgPresupuesto: number | null;
  } | null>(null);

  useEffect(() => {
    if (!dispositivo || dispositivo.length < 3) {
      setData(null);
      return;
    }
    const timer = setTimeout(async () => {
      const result = await getDeviceHistory(dispositivo);
      if (result.count > 0) setData(result);
      else setData(null);
    }, 500);
    return () => clearTimeout(timer);
  }, [dispositivo]);

  if (!data) return null;

  return (
    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mt-3">
      <div className="flex items-center gap-2 mb-1.5">
        <History className="w-3.5 h-3.5 text-blue-400" />
        <span className="text-xs font-semibold text-blue-400">
          Este modelo se reparó {data.count}{" "}
          {data.count === 1 ? "vez" : "veces"}
        </span>
      </div>
      {data.problemas.length > 0 && (
        <div className="text-xs text-gray-400 space-y-0.5">
          <span className="text-gray-500">Problemas frecuentes:</span>
          {data.problemas.map((p, i) => (
            <div key={i} className="flex items-center gap-1.5 ml-2">
              <span className="w-1 h-1 rounded-full bg-blue-400" />
              <span className="capitalize truncate">{p.problema}</span>
              <span className="text-gray-600">({p.count})</span>
            </div>
          ))}
        </div>
      )}
      {data.avgPresupuesto && (
        <div className="text-xs text-gray-500 mt-1.5">
          Presupuesto promedio:{" "}
          <span className="text-brand-teal font-medium">
            ${data.avgPresupuesto.toLocaleString("es-AR")}
          </span>
        </div>
      )}
    </div>
  );
}
