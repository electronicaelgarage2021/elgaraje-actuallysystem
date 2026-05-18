"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createVenta } from "@/lib/actions/ventas";
import { Plus } from "lucide-react";
import { METODOS_PAGO } from "@/lib/constants";

export function VentasForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData(e.currentTarget);
      await createVenta(fd);
      e.currentTarget.reset();
      router.refresh();
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface-800 border border-surface-600 rounded-xl p-5">
      <h2 className="text-sm font-semibold mb-4">Registrar venta</h2>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
        <div className="md:col-span-4">
          <label className="text-xs text-gray-400 mb-1 block">Producto *</label>
          <input
            name="producto"
            required
            placeholder="Ej: Funda Samsung A54"
            className="w-full bg-surface-700 border border-surface-600 rounded-lg px-3 py-2.5 text-sm placeholder-gray-500"
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs text-gray-400 mb-1 block">Monto *</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
            <input
              name="monto"
              type="number"
              required
              min="1"
              placeholder="5000"
              className="w-full bg-surface-700 border border-surface-600 rounded-lg pl-7 pr-3 py-2.5 text-sm placeholder-gray-500"
            />
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="text-xs text-gray-400 mb-1 block">Metodo *</label>
          <select
            name="metodo"
            required
            defaultValue="efectivo"
            className="w-full bg-surface-700 border border-surface-600 rounded-lg px-3 py-2.5 text-sm text-gray-300"
          >
            {METODOS_PAGO.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-3">
          <label className="text-xs text-gray-400 mb-1 block">Nota (opcional)</label>
          <input
            name="nota"
            placeholder="Ej: Cliente frecuente"
            className="w-full bg-surface-700 border border-surface-600 rounded-lg px-3 py-2.5 text-sm placeholder-gray-500"
          />
        </div>
        <div className="md:col-span-1">
          <button
            type="submit"
            disabled={loading}
            className="w-full h-[42px] rounded-lg bg-brand-teal hover:bg-brand-teal-dark text-surface-900 font-semibold text-sm transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </form>
  );
}
