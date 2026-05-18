"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { getDaySummary, getMonthActivity } from "@/lib/actions/calendar";
import type { MonthActivity } from "@/lib/actions/calendar";

const DIAS = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];
const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const ACTIVITY_DOTS: {
  key: "ingresados" | "entregados" | "cobros" | "ventas" | "repuestos";
  color: string;
  label: string;
  emoji?: string;
}[] = [
  { key: "ingresados", color: "bg-blue-400", label: "Ingresados" },
  { key: "entregados", color: "bg-green-400", label: "Entregados" },
  { key: "cobros", color: "bg-brand-teal", label: "Cobros", emoji: "💵" },
  { key: "ventas", color: "bg-amber-400", label: "Ventas" },
  { key: "repuestos", color: "bg-orange-400", label: "Repuestos" },
];

interface CalendarViewProps {
  initialActivity: MonthActivity;
  initialYear: number;
  initialMonth: number; // 0-indexed (JS Date month)
}

export function CalendarView({
  initialActivity,
  initialYear,
  initialMonth,
}: CalendarViewProps) {
  const now = new Date();
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [activity, setActivity] = useState<MonthActivity>(initialActivity);
  const [loadingMonth, setLoadingMonth] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [daySummary, setDaySummary] = useState<any>(null);
  const [loadingDay, setLoadingDay] = useState(false);

  const fetchActivity = useCallback(async (y: number, m: number) => {
    setLoadingMonth(true);
    const data = await getMonthActivity(y, m + 1); // server action expects 1-indexed month
    setActivity(data);
    setLoadingMonth(false);
  }, []);

  function prevMonth() {
    const newMonth = month === 0 ? 11 : month - 1;
    const newYear = month === 0 ? year - 1 : year;
    setMonth(newMonth);
    setYear(newYear);
    fetchActivity(newYear, newMonth);
  }

  function nextMonth() {
    const newMonth = month === 11 ? 0 : month + 1;
    const newYear = month === 11 ? year + 1 : year;
    setMonth(newMonth);
    setYear(newYear);
    fetchActivity(newYear, newMonth);
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

  const today = now.toISOString().split("T")[0];

  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-2 rounded-lg bg-surface-700 hover:bg-surface-600 text-gray-400 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h2 className="text-lg font-semibold">
          {MESES[month]} {year}
          {loadingMonth && (
            <span className="ml-2 inline-block w-3 h-3 border-2 border-brand-teal border-t-transparent rounded-full animate-spin align-middle" />
          )}
        </h2>
        <button
          onClick={nextMonth}
          className="p-2 rounded-lg bg-surface-700 hover:bg-surface-600 text-gray-400 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="bg-surface-800 border border-surface-600 rounded-xl overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7">
          {DIAS.map((d) => (
            <div
              key={d}
              className="px-2 py-2 text-center text-[0.65rem] font-semibold text-gray-500 border-b border-surface-600"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            if (day === null) {
              return (
                <div
                  key={`empty-${i}`}
                  className="min-h-[80px] border-b border-r border-surface-700 bg-surface-800/50"
                />
              );
            }

            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayActivity = activity[dateStr];
            const isToday = dateStr === today;

            const activeDots = ACTIVITY_DOTS.filter(
              (dot) => dayActivity?.[dot.key]
            );

            return (
              <div
                key={dateStr}
                className={`relative min-h-[80px] border-b border-r border-surface-700 p-1.5 flex flex-col ${
                  isToday ? "bg-brand-teal/5" : ""
                }`}
              >
                {/* Day number */}
                <div
                  className={`text-xs mb-1 ${
                    isToday ? "text-brand-teal font-bold" : "text-gray-500"
                  }`}
                >
                  {day}
                </div>

                {/* Activity button */}
                <div className="flex-1 flex items-center justify-center px-0.5 pb-0.5">
                  <button
                    onClick={() => openDayModal(dateStr)}
                    className={`w-full h-8 rounded-lg border flex items-center justify-center gap-1 transition-all ${
                      isToday
                        ? "bg-surface-700 border-brand-teal/30 hover:border-brand-teal/60"
                        : "bg-surface-700 border-surface-600 hover:border-surface-500"
                    } hover:bg-surface-600`}
                  >
                    {activeDots.map((dot) => (
                      <span
                        key={dot.key}
                        className={`w-2 h-2 rounded-full ${dot.color}`}
                      />
                    ))}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 justify-center mt-4">
        {ACTIVITY_DOTS.map((dot) => (
          <div key={dot.key} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${dot.color}`} />
            <span className="text-xs text-gray-400">
              {dot.emoji ? `${dot.emoji} ` : ""}
              {dot.label}
            </span>
          </div>
        ))}
      </div>

      {/* Day Summary Modal */}
      {selectedDate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setSelectedDate(null);
              setDaySummary(null);
            }}
          />
          <div className="relative bg-surface-800 border border-surface-600 rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-2xl animate-in">
            {/* Header */}
            <div className="sticky top-0 bg-surface-800 border-b border-surface-600 px-5 py-4 flex items-center justify-between rounded-t-2xl">
              <div>
                <h3 className="font-bold text-lg">
                  {new Date(selectedDate + "T12:00:00").toLocaleDateString(
                    "es-AR",
                    { weekday: "long", day: "numeric", month: "long" }
                  )}
                </h3>
                {daySummary && !loadingDay && (
                  <p className="text-sm text-green-400 font-semibold mt-0.5">
                    Caja del dia: $
                    {daySummary.totalCaja.toLocaleString("es-AR")}
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  setSelectedDate(null);
                  setDaySummary(null);
                }}
                className="p-2 rounded-lg hover:bg-surface-700 text-gray-400 hover:text-white transition-colors"
              >
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
                        <div
                          key={o.id}
                          className="bg-surface-700/50 rounded-lg px-3 py-2 text-sm flex justify-between"
                        >
                          <span>
                            #{o.numero} {o.dispositivo}{" "}
                            <span className="text-gray-500">
                              - {o.cliente?.nombre}
                            </span>
                          </span>
                          {o.presupuesto && (
                            <span className="text-green-400 font-medium">
                              ${Number(o.presupuesto).toLocaleString("es-AR")}
                            </span>
                          )}
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
                        <div
                          key={o.id}
                          className="bg-surface-700/50 rounded-lg px-3 py-2 text-sm flex justify-between"
                        >
                          <span>
                            #{o.numero} {o.dispositivo}{" "}
                            <span className="text-gray-500">
                              - {o.cliente?.nombre}
                            </span>
                          </span>
                          {o.presupuesto && (
                            <span className="text-green-400 font-medium">
                              ${Number(o.presupuesto).toLocaleString("es-AR")}
                            </span>
                          )}
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
                      Cobros ({daySummary.pagos.length}) — $
                      {daySummary.totalPagos.toLocaleString("es-AR")}
                    </h4>
                    <div className="space-y-1.5">
                      {daySummary.pagos.map((p: any) => (
                        <div
                          key={p.id}
                          className="bg-surface-700/50 rounded-lg px-3 py-2 text-sm flex justify-between"
                        >
                          <span>
                            {p.tipo === "sena" ? "Sena" : "Pago"} #
                            {p.orden?.numero} {p.orden?.dispositivo}{" "}
                            <span className="text-gray-500 capitalize">
                              ({p.metodo})
                            </span>
                          </span>
                          <span className="text-green-400 font-medium">
                            ${Number(p.monto).toLocaleString("es-AR")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ventas */}
                {daySummary.ventas.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-amber-400 mb-2 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      Ventas de productos ({daySummary.ventas.length}) — $
                      {daySummary.totalVentas.toLocaleString("es-AR")}
                    </h4>
                    <div className="space-y-1.5">
                      {daySummary.ventas.map((v: any) => (
                        <div
                          key={v.id}
                          className="bg-surface-700/50 rounded-lg px-3 py-2 text-sm flex justify-between"
                        >
                          <span>
                            {v.producto}{" "}
                            <span className="text-gray-500 capitalize">
                              ({v.metodo})
                            </span>
                          </span>
                          <span className="text-green-400 font-medium">
                            ${Number(v.monto).toLocaleString("es-AR")}
                          </span>
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
                        <div
                          key={r.id}
                          className="bg-surface-700/50 rounded-lg px-3 py-2 text-sm flex justify-between"
                        >
                          <span>
                            {r.nombre}{" "}
                            {r.orden && (
                              <span className="text-gray-500">
                                — #{r.orden.numero} {r.orden.dispositivo}
                              </span>
                            )}
                          </span>
                          <span className="text-xs text-gray-500 capitalize">
                            {r.proveedor === "cordoba"
                              ? "Cordoba"
                              : r.proveedor === "vcp"
                                ? "VCP"
                                : "Sin asignar"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty state */}
                {daySummary.ingresadas.length === 0 &&
                  daySummary.entregadas.length === 0 &&
                  daySummary.pagos.length === 0 &&
                  daySummary.ventas.length === 0 &&
                  daySummary.repuestos.length === 0 && (
                    <div className="text-center py-8 text-gray-500 text-sm">
                      No hay actividad registrada este dia
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
