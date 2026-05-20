"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Package, Link2 } from "lucide-react";
import { createGasto } from "@/lib/actions/gastos";

interface OrdenActiva {
  id: string;
  numero: number;
  dispositivo: string;
  cliente: { nombre: string } | { nombre: string }[] | null;
}

const CATEGORIAS_REPUESTO = [
  "Modulo",
  "Bateria",
  "Marco",
  "Placa de carga",
  "Flex Main",
  "Flex Power/Vol",
  "Partes chicas",
  "Huella",
  "Parlante",
  "Camara/Vidrio",
  "Glass/Tapa",
  "Accesorios",
  "Herramientas",
];

function getClienteName(c: OrdenActiva["cliente"]): string {
  if (!c) return "";
  if (Array.isArray(c)) return c[0]?.nombre || "";
  return c.nombre;
}

export function RepuestosForm({ ordenesActivas }: { ordenesActivas: OrdenActiva[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<string[]>([]);
  const [ordenId, setOrdenId] = useState("");
  const [metodo, setMetodo] = useState("efectivo");

  function toggleCategoria(cat: string) {
    setCategoriasSeleccionadas((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!descripcion.trim() || !monto || categoriasSeleccionadas.length === 0) return;

    const cats = categoriasSeleccionadas.join(", ");
    const desc = `${descripcion.trim()} — ${cats}`;
    const ordenInfo = ordenesActivas.find((o) => o.id === ordenId);
    const fullDesc = ordenInfo
      ? `${desc} (Orden #${ordenInfo.numero} - ${ordenInfo.dispositivo})`
      : desc;

    const fd = new FormData();
    fd.set("descripcion", fullDesc);
    fd.set("monto", monto);
    fd.set("categoria", "repuestos");
    fd.set("metodo", metodo);

    startTransition(async () => {
      try {
        await createGasto(fd);
        setDescripcion("");
        setMonto("");
        setCategoriasSeleccionadas([]);
        setOrdenId("");
        router.refresh();
      } catch {
        alert("Error al registrar repuesto");
      }
    });
  }

  return (
    <div className="bg-surface-800 border border-surface-600 rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-surface-600">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <Package className="w-4 h-4 text-brand-teal" />
          Cargar Repuesto
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
        {/* Descripcion + Monto */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <label className="text-[0.65rem] text-gray-400 font-medium mb-1 block">
              Marca y modelo del dispositivo *
            </label>
            <input
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              required
              placeholder="Ej: Samsung A54, Moto G5, iPhone 11"
              className="w-full bg-surface-700 border border-surface-600 rounded-lg px-3 py-2.5 text-sm text-gray-200 placeholder-gray-500"
            />
          </div>
          <div>
            <label className="text-[0.65rem] text-gray-400 font-medium mb-1 block">
              Costo *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
              <input
                type="number"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                required
                min="1"
                placeholder="0"
                className="w-full bg-surface-700 border border-surface-600 rounded-lg pl-7 pr-3 py-2.5 text-sm text-gray-200 placeholder-gray-500"
              />
            </div>
          </div>
        </div>

        {/* Categorias */}
        <div>
          <label className="text-[0.65rem] text-gray-400 font-medium mb-2 block">
            Tipo de repuesto * (podes seleccionar varios)
          </label>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIAS_REPUESTO.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategoria(cat)}
                className={`px-2.5 py-1 rounded-full text-[0.65rem] font-medium transition-colors ${
                  categoriasSeleccionadas.includes(cat)
                    ? "bg-brand-teal/15 text-brand-teal border border-brand-teal/30"
                    : "bg-surface-700 text-gray-400 hover:bg-surface-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Orden + Metodo + Submit */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div>
            <label className="text-[0.65rem] text-gray-400 font-medium mb-1 block">
              <Link2 className="w-3 h-3 inline mr-1" />
              Vincular a orden (opcional)
            </label>
            <select
              value={ordenId}
              onChange={(e) => setOrdenId(e.target.value)}
              className="w-full bg-surface-700 border border-surface-600 rounded-lg px-3 py-2.5 text-sm text-gray-200"
            >
              <option value="">Sin vincular</option>
              {ordenesActivas.map((o) => (
                <option key={o.id} value={o.id}>
                  #{o.numero} - {o.dispositivo} ({getClienteName(o.cliente)})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[0.65rem] text-gray-400 font-medium mb-1 block">
              Metodo de pago
            </label>
            <select
              value={metodo}
              onChange={(e) => setMetodo(e.target.value)}
              className="w-full bg-surface-700 border border-surface-600 rounded-lg px-3 py-2.5 text-sm text-gray-200"
            >
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="debito">Debito</option>
              <option value="credito">Credito</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={isPending || !descripcion.trim() || !monto || categoriasSeleccionadas.length === 0}
            className="h-[42px] rounded-lg bg-brand-teal hover:bg-brand-teal-dark text-surface-900 font-semibold text-sm transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {isPending ? "Cargando..." : "Cargar repuesto"}
          </button>
        </div>
      </form>
    </div>
  );
}
