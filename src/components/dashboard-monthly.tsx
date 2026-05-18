"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, ChevronDown, ChevronUp, BarChart3 } from "lucide-react";

interface MonthlyStats {
  reparaciones: number;
  reparacionesPrev: number;
  ingresos: number;
  ingresosPrev: number;
  ticketPromedio: number;
  entregadas: number;
  ventasProductos: number;
  semanas: number[];
}

export function DashboardMonthly({ stats }: { stats: MonthlyStats }) {
  const [open, setOpen] = useState(false);

  const ingresoDiff = stats.ingresosPrev > 0
    ? Math.round(((stats.ingresos - stats.ingresosPrev) / stats.ingresosPrev) * 100)
    : 0;
  const repDiff = stats.reparacionesPrev > 0
    ? Math.round(((stats.reparaciones - stats.reparacionesPrev) / stats.reparacionesPrev) * 100)
    : 0;

  const maxWeek = Math.max(...stats.semanas, 1);

  return (
    <div className="bg-surface-800 border border-surface-600 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-surface-700/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-brand-teal" />
          <h2 className="font-semibold text-sm">Resumen del mes</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-brand-teal">
            ${stats.ingresos.toLocaleString("es-AR")}
          </span>
          {ingresoDiff !== 0 && (
            <span className={`text-xs font-medium flex items-center gap-0.5 ${ingresoDiff > 0 ? "text-green-400" : "text-brand-red"}`}>
              {ingresoDiff > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {ingresoDiff > 0 ? "+" : ""}{ingresoDiff}%
            </span>
          )}
          {open ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-surface-600 pt-4 space-y-4">
          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-surface-700/50 rounded-lg p-3">
              <div className="text-xs text-gray-500">Reparaciones</div>
              <div className="text-xl font-bold">{stats.reparaciones}</div>
              {repDiff !== 0 && (
                <div className={`text-xs ${repDiff > 0 ? "text-green-400" : "text-brand-red"}`}>
                  {repDiff > 0 ? "+" : ""}{repDiff}% vs mes ant.
                </div>
              )}
            </div>
            <div className="bg-surface-700/50 rounded-lg p-3">
              <div className="text-xs text-gray-500">Entregadas</div>
              <div className="text-xl font-bold text-green-400">{stats.entregadas}</div>
            </div>
            <div className="bg-surface-700/50 rounded-lg p-3">
              <div className="text-xs text-gray-500">Ticket promedio</div>
              <div className="text-xl font-bold">${stats.ticketPromedio.toLocaleString("es-AR")}</div>
            </div>
            <div className="bg-surface-700/50 rounded-lg p-3">
              <div className="text-xs text-gray-500">Ventas productos</div>
              <div className="text-xl font-bold text-purple-400">{stats.ventasProductos}</div>
            </div>
          </div>

          {/* Weekly bar chart */}
          <div>
            <div className="text-xs text-gray-500 mb-2">Ingresos por semana</div>
            <div className="flex items-end gap-2 h-20">
              {stats.semanas.map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-brand-teal/30 rounded-t transition-all"
                    style={{ height: `${(val / maxWeek) * 100}%`, minHeight: val > 0 ? "4px" : "0" }}
                  />
                  <span className="text-[0.6rem] text-gray-600">S{i + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
