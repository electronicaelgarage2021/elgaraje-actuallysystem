"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function VentasDatePicker({ currentDate }: { currentDate: string }) {
  const router = useRouter();

  function navigate(offset: number) {
    const date = new Date(currentDate + "T12:00:00");
    date.setDate(date.getDate() + offset);
    const newDate = date.toISOString().split("T")[0];
    router.push(`/ventas?fecha=${newDate}`);
  }

  const isToday = currentDate === new Date().toISOString().split("T")[0];

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => navigate(-1)}
        className="p-2 rounded-lg bg-surface-700 hover:bg-surface-600 text-gray-400 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <input
        type="date"
        value={currentDate}
        onChange={(e) => router.push(`/ventas?fecha=${e.target.value}`)}
        className="bg-surface-700 border border-surface-600 rounded-lg px-3 py-2 text-sm text-gray-300"
      />
      <button
        onClick={() => navigate(1)}
        disabled={isToday}
        className="p-2 rounded-lg bg-surface-700 hover:bg-surface-600 text-gray-400 transition-colors disabled:opacity-30"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
      {!isToday && (
        <button
          onClick={() => router.push("/ventas")}
          className="text-xs text-brand-teal hover:underline"
        >
          Hoy
        </button>
      )}
    </div>
  );
}
