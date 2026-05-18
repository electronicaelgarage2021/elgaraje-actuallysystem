"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";

type RangeKey = "hoy" | "esta_semana" | "ultima_semana" | "ultimos_10" | "ultimo_mes" | "personalizado";

interface CajaDatePickerProps {
  desde: string;
  hasta: string;
  periodo?: string;
}

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

function toDateStr(d: Date): string {
  return d.toISOString().split("T")[0];
}

function getMondayOfWeek(d: Date): Date {
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  return monday;
}

function getRangeForKey(key: RangeKey): { desde: string; hasta: string } | null {
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  switch (key) {
    case "hoy":
      return { desde: toDateStr(today), hasta: toDateStr(today) };
    case "esta_semana": {
      const monday = getMondayOfWeek(today);
      return { desde: toDateStr(monday), hasta: toDateStr(today) };
    }
    case "ultima_semana": {
      const lastWeekDay = new Date(today);
      lastWeekDay.setDate(today.getDate() - 7);
      const monday = getMondayOfWeek(lastWeekDay);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return { desde: toDateStr(monday), hasta: toDateStr(sunday) };
    }
    case "ultimos_10": {
      const tenAgo = new Date(today);
      tenAgo.setDate(today.getDate() - 9);
      return { desde: toDateStr(tenAgo), hasta: toDateStr(today) };
    }
    case "ultimo_mes": {
      const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return { desde: toDateStr(firstOfMonth), hasta: toDateStr(today) };
    }
    default:
      return null;
  }
}

function detectActiveKey(desde: string, hasta: string, periodo?: string): RangeKey {
  if (periodo && ["hoy", "esta_semana", "ultima_semana", "ultimos_10", "ultimo_mes"].includes(periodo)) {
    return periodo as RangeKey;
  }
  const keys: RangeKey[] = ["hoy", "esta_semana", "ultima_semana", "ultimos_10", "ultimo_mes"];
  for (const key of keys) {
    const range = getRangeForKey(key);
    if (range && range.desde === desde && range.hasta === hasta) return key;
  }
  return "personalizado";
}

const RANGE_OPTIONS: { key: RangeKey; label: string }[] = [
  { key: "hoy", label: "Hoy" },
  { key: "esta_semana", label: "Esta semana" },
  { key: "ultima_semana", label: "Última semana" },
  { key: "ultimos_10", label: "Últimos 10 días" },
  { key: "ultimo_mes", label: "Último mes" },
  { key: "personalizado", label: "Personalizado" },
];

export function CajaDatePicker({ desde, hasta, periodo }: CajaDatePickerProps) {
  const activeKey = detectActiveKey(desde, hasta, periodo);
  const [showCustom, setShowCustom] = useState(activeKey === "personalizado");
  const [customDesde, setCustomDesde] = useState(desde);
  const [customHasta, setCustomHasta] = useState(hasta);

  function navigateRange(d: string, h: string, p?: string) {
    const params = new URLSearchParams({ desde: d, hasta: h });
    if (p) params.set("periodo", p);
    window.location.href = `/caja?${params}`;
  }

  function handleQuickSelect(key: RangeKey) {
    if (key === "personalizado") {
      setShowCustom(true);
      return;
    }
    setShowCustom(false);
    const range = getRangeForKey(key);
    if (range) navigateRange(range.desde, range.hasta, key);
  }

  function handleCustomApply() {
    if (customDesde && customHasta) {
      const d = customDesde <= customHasta ? customDesde : customHasta;
      const h = customDesde <= customHasta ? customHasta : customDesde;
      navigateRange(d, h);
    }
  }

  return (
    <div className="flex flex-col items-start md:items-end gap-2">
      <div className="flex flex-wrap gap-1.5">
        {RANGE_OPTIONS.map(({ key, label }) => {
          const isActive = key === "personalizado"
            ? activeKey === "personalizado"
            : activeKey === key;

          return (
            <button
              key={key}
              onClick={() => handleQuickSelect(key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                isActive
                  ? "bg-brand-teal/15 text-brand-teal border border-brand-teal/30"
                  : "bg-surface-700 text-gray-400 hover:bg-surface-600"
              }`}
            >
              {key === "personalizado" && <Calendar className="w-3 h-3 inline-block mr-1 -mt-0.5" />}
              {label}
            </button>
          );
        })}
      </div>

      {showCustom && (
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="date"
            value={customDesde}
            max={getToday()}
            onChange={(e) => setCustomDesde(e.target.value)}
            className="bg-surface-700 border border-surface-600 rounded-lg px-3 py-1.5 text-xs text-gray-300"
          />
          <span className="text-gray-500 text-xs">a</span>
          <input
            type="date"
            value={customHasta}
            max={getToday()}
            onChange={(e) => setCustomHasta(e.target.value)}
            className="bg-surface-700 border border-surface-600 rounded-lg px-3 py-1.5 text-xs text-gray-300"
          />
          <button
            onClick={handleCustomApply}
            className="px-3 py-1.5 rounded-lg bg-brand-teal text-black text-xs font-semibold hover:bg-brand-teal/90 transition-colors"
          >
            Aplicar
          </button>
        </div>
      )}
    </div>
  );
}
