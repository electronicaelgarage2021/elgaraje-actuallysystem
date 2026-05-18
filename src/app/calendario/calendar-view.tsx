"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Eye, X } from "lucide-react";
import Link from "next/link";
import { getEstadoConfig } from "@/lib/constants";
import { getDaySummary } from "@/lib/actions/calendar";
import type { EstadoOrden } from "@/lib/types";

interface Entrega {
  id: string;
  numero: number;
  dispositivo: string;
  clienteNombre: string;
  fecha: string;
  estado: EstadoOrden;
}

const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export function CalendarView({ entregas }: { entregas: Entrega[] }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [daySummary, setDaySummary] = useState<any>(null);
  const [loadingDay, setLoadingDay] = useState(false);

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
  }

  async function openDayModal(fecha: string) {
    setSelectedDate(fecha);
    setLoadingDay(true);
    const data = await getDaySummary(fecha);
    setDaySummary(data);
    setLoadingDay(false);
  }

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = lastDay.getDate();

  const entregasByDate: Record<string, Entrega[]> = {};
  for (const e of entregas) {
    const d = e.fecha;
    if (!entregasByDate[d]) entregasByDate[d] = [];
    entregasByDate[d].push(e);
  }

  const today = now.toISOString().split("T")[0];

  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-2 rounded-lg bg-surface-700 hover:bg-surface-600 text-gray-400 transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h2 className="text-lg font-semibold">{MESES[month]} {year}</h2>
        <button onClick={nextMonth} className="p-2 rounded-lg bg-surface-700 hover:bg-surface-600 text-gray-400 transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-surface-800 border border-surface-600 rounded-xl overflow-hidden">
        <div className="grid grid-cols-7">
          {DIAS.map((d) => (
            <div key={d} className="px-2 py-2 text-center text-[0.65rem] font-semibold text-gray-500 border-b border-surface-600">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            if (day === null) {
              return <div key={`empty-${i}`} className="min-h-[80px] border-b border-r border-surface-700 bg-surface-800/50" />;
            }

            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayEntregas = entregasByDate[dateStr] || [];
            const isToday = dateStr === today;

            return (
              <div
                key={dateStr}
                className={`relative group min-h-[80px] border-b border-r border-surface-700 p-1.5 ${
                  isToday ? "bg-brand-teal/5" : ""
                }`}
              >
                <button
                  onClick={() => openDayModal(dateStr)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-surface-600 hover:bg-brand-teal/20 hover:text-brand-teal flex items-center justify-center text-gray-500 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Eye className="w-3 h-3" />
                </button>
                <div className={`text-xs mb-1 ${isToday ? "text-brand-teal font-bold" : "text-gray-500"}`}>
                  {day}
                </div>
                <div className="space-y-0.5">
                  {dayEntregas.slice(0, 3).map((e) => {
                    const config = getEstadoConfig(e.estado);
                    return (
                      <Link
                        key={e.id}
                        href={`/ordenes/${e.id}`}
                        className={`block px-1.5 py-0.5 rounded text-[0.6rem] truncate ${config.bgColor} hover:opacity-80 transition-opacity`}
                      >
                        #{e.numero} {e.dispositivo}
                      </Link>
                    );
                  })}
                  {dayEntregas.length > 3 && (
                    <div className="text-[0.55rem] text-gray-500 pl-1">
                      +{dayEntregas.length - 3} más
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Summary Modal */}
      {selectedDate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setSelectedDate(null); setDaySummary(null); }} />
          <div className="relative bg-surface-800 border border-surface-600 rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-2xl animate-in">
            {/* Header */}
            <div className="sticky top-0 bg-surface-800 border-b border-surface-600 px-5 py-4 flex items-center justify-between rounded-t-2xl">
              <div>
                <h3 className="font-bold text-lg">
                  {new Date(selectedDate + "T12:00:00").toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}
                </h3>
                {daySummary && !loadingDay && (
                  <p className="text-sm text-brand-teal font-semibold mt-0.5">
                    Caja del día: ${daySummary.totalCaja.toLocaleString("es-AR")}
                  </p>
                )}
              </div>
              <button onClick={() => { setSelectedDate(null); setDaySummary(null); }} className="p-2 rounded-lg hover:bg-surface-700 text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingDay ? (
              <div className="p-8 flex justify-center">
                <div className="w-6 h-6 border-2 border-brand-teal border-t-transparent rounded-full animate-spin" />
              </div>
            ) : daySummary ? (
              <div className="p-5 space-y-5">
                {/* Ingresos */}
                {daySummary.ingresadas.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-blue-400 mb-2 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-400" />
                      Dispositivos ingresados ({daySummary.ingresadas.length})
                    </h4>
                    <div className="space-y-1.5">
                      {daySummary.ingresadas.map((o: any) => (
                        <div key={o.id} className="bg-surface-700/50 rounded-lg px-3 py-2 text-sm flex justify-between">
                          <span>#{o.numero} {o.dispositivo} <span className="text-gray-500">- {o.cliente?.nombre}</span></span>
                          {o.presupuesto && <span className="text-brand-teal font-medium">${Number(o.presupuesto).toLocaleString("es-AR")}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Entregas */}
                {daySummary.entregadas.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-green-400 mb-2 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-green-400" />
                      Dispositivos entregados ({daySummary.entregadas.length})
                    </h4>
                    <div className="space-y-1.5">
                      {daySummary.entregadas.map((o: any) => (
                        <div key={o.id} className="bg-surface-700/50 rounded-lg px-3 py-2 text-sm flex justify-between">
                          <span>#{o.numero} {o.dispositivo} <span className="text-gray-500">- {o.cliente?.nombre}</span></span>
                          {o.presupuesto && <span className="text-green-400 font-medium">${Number(o.presupuesto).toLocaleString("es-AR")}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pagos */}
                {daySummary.pagos.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-brand-teal mb-2 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-brand-teal" />
                      Cobros ({daySummary.pagos.length}) — ${daySummary.totalPagos.toLocaleString("es-AR")}
                    </h4>
                    <div className="space-y-1.5">
                      {daySummary.pagos.map((p: any) => (
                        <div key={p.id} className="bg-surface-700/50 rounded-lg px-3 py-2 text-sm flex justify-between">
                          <span>{p.tipo === "sena" ? "Seña" : "Pago"} #{p.orden?.numero} {p.orden?.dispositivo} <span className="text-gray-500 capitalize">({p.metodo})</span></span>
                          <span className="text-brand-teal font-medium">${Number(p.monto).toLocaleString("es-AR")}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ventas */}
                {daySummary.ventas.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-purple-400 mb-2 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-400" />
                      Ventas de productos ({daySummary.ventas.length}) — ${daySummary.totalVentas.toLocaleString("es-AR")}
                    </h4>
                    <div className="space-y-1.5">
                      {daySummary.ventas.map((v: any) => (
                        <div key={v.id} className="bg-surface-700/50 rounded-lg px-3 py-2 text-sm flex justify-between">
                          <span>{v.producto} <span className="text-gray-500 capitalize">({v.metodo})</span></span>
                          <span className="text-purple-400 font-medium">${Number(v.monto).toLocaleString("es-AR")}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Repuestos pedidos */}
                {daySummary.repuestos.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-orange-400 mb-2 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-orange-400" />
                      Repuestos solicitados ({daySummary.repuestos.length})
                    </h4>
                    <div className="space-y-1.5">
                      {daySummary.repuestos.map((r: any) => (
                        <div key={r.id} className="bg-surface-700/50 rounded-lg px-3 py-2 text-sm flex justify-between">
                          <span>{r.nombre} {r.orden && <span className="text-gray-500">— #{r.orden.numero} {r.orden.dispositivo}</span>}</span>
                          <span className="text-xs text-gray-500 capitalize">{r.proveedor === "cordoba" ? "Córdoba" : r.proveedor === "vcp" ? "VCP" : "Sin asignar"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty state */}
                {daySummary.ingresadas.length === 0 && daySummary.entregadas.length === 0 && daySummary.pagos.length === 0 && daySummary.ventas.length === 0 && daySummary.repuestos.length === 0 && (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No hay actividad registrada este día
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
