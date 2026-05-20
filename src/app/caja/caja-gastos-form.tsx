"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Receipt } from "lucide-react";
import { createGasto } from "@/lib/actions/gastos";

const CATEGORIAS = [
  "Luz",
  "Agua",
  "Gas",
  "Internet",
  "Alquiler",
  "Insumos",
  "Herramientas",
  "Otro",
];

export function CajaGastosForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    startTransition(async () => {
      try {
        await createGasto(fd);
        form.reset();
        setOpen(false);
        router.refresh();
      } catch {
        alert("Error al registrar gasto");
      }
    });
  }

  return (
    <div className="bg-surface-800 border border-surface-600 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-5 py-3 flex items-center justify-between hover:bg-surface-700/40 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Receipt className="w-4 h-4 text-red-400" />
          <h2 className="text-sm font-semibold">Registrar gasto</h2>
        </div>
        <Plus
          className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-45" : ""}`}
        />
      </button>
      {open && (
        <form onSubmit={handleSubmit} className="px-5 pb-4 pt-2 border-t border-surface-600 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[0.65rem] text-gray-400 font-medium mb-1 block">Descripción</label>
              <input
                name="descripcion"
                required
                placeholder="Ej: Factura de luz mayo"
                className="w-full bg-surface-700 border border-surface-600 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-500"
              />
            </div>
            <div>
              <label className="text-[0.65rem] text-gray-400 font-medium mb-1 block">Monto</label>
              <input
                name="monto"
                type="number"
                required
                min="1"
                placeholder="$0"
                className="w-full bg-surface-700 border border-surface-600 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[0.65rem] text-gray-400 font-medium mb-1 block">Categoría</label>
              <select
                name="categoria"
                className="w-full bg-surface-700 border border-surface-600 rounded-lg px-3 py-2 text-sm text-gray-200"
              >
                {CATEGORIAS.map((c) => (
                  <option key={c} value={c.toLowerCase()}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[0.65rem] text-gray-400 font-medium mb-1 block">Método de pago</label>
              <select
                name="metodo"
                className="w-full bg-surface-700 border border-surface-600 rounded-lg px-3 py-2 text-sm text-gray-200"
              >
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
                <option value="debito">Débito</option>
                <option value="credito">Crédito</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-red-500/15 hover:bg-red-500/25 text-red-400 font-semibold py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            {isPending ? "Registrando..." : "Registrar gasto"}
          </button>
        </form>
      )}
    </div>
  );
}
