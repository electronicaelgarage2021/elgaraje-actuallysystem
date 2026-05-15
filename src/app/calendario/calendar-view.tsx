"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { getEstadoConfig } from "@/lib/constants";
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

export function CalendarView({ entregas, initialMonth }: { entregas: Entrega[]; initialMonth?: string }) {
  const now = new Date();
  const [year, setYear] = useState(initialMonth ? parseInt(initialMonth.split("-")[0]) : now.getFullYear());
  const [month, setMonth] = useState(initialMonth ? parseInt(initialMonth.split("-")[1]) - 1 : now.getMonth());

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
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
                className={`min-h-[80px] border-b border-r border-surface-700 p-1.5 ${
                  isToday ? "bg-brand-teal/5" : ""
                }`}
              >
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
    </div>
  );
}
