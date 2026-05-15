"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getOrder, updateOrder } from "@/lib/actions/orders";
import { ChevronLeft, Smartphone, Wrench, DollarSign, Calendar } from "lucide-react";
import Link from "next/link";

export default function EditarOrden() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [dispositivo, setDispositivo] = useState("");
  const [problema, setProblema] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [presupuesto, setPresupuesto] = useState("");
  const [fechaEntrega, setFechaEntrega] = useState("");

  useEffect(() => {
    async function load() {
      const orden = await getOrder(id);
      setDispositivo(orden.dispositivo || "");
      setProblema(orden.problema || "");
      setObservaciones(orden.observaciones || "");
      setPresupuesto(orden.presupuesto ? String(orden.presupuesto) : "");
      setFechaEntrega(orden.fecha_entrega_estimada || "");
      setFetching(false);
    }
    load();
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData();
    fd.set("dispositivo", dispositivo);
    fd.set("problema", problema);
    fd.set("observaciones", observaciones);
    fd.set("presupuesto", presupuesto);
    fd.set("fecha_entrega_estimada", fechaEntrega);
    await updateOrder(id, fd);
    router.push(`/ordenes/${id}`);
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand-teal border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Cargando orden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto fade-in">
      <Link
        href={`/ordenes/${id}`}
        className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Volver a la orden
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Editar Orden</h1>
        <p className="text-gray-400 text-sm mt-1">Modificar datos de la reparación</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-surface-800 border border-surface-600 rounded-xl p-5">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-brand-teal" />
            Equipo
          </h2>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Dispositivo *</label>
            <input
              type="text"
              required
              value={dispositivo}
              onChange={(e) => setDispositivo(e.target.value)}
              className="w-full bg-surface-700 border border-surface-600 rounded-lg px-3 py-2.5 text-sm placeholder-gray-500"
            />
          </div>
        </div>

        <div className="bg-surface-800 border border-surface-600 rounded-xl p-5">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-brand-teal" />
            Reparación
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Problema reportado *</label>
              <textarea
                required
                rows={2}
                value={problema}
                onChange={(e) => setProblema(e.target.value)}
                className="w-full bg-surface-700 border border-surface-600 rounded-lg px-3 py-2.5 text-sm placeholder-gray-500 resize-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Notas internas</label>
              <textarea
                rows={2}
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Notas que solo vos ves..."
                className="w-full bg-surface-700 border border-surface-600 rounded-lg px-3 py-2.5 text-sm placeholder-gray-500 resize-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-surface-800 border border-surface-600 rounded-xl p-5">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-brand-teal" />
            Presupuesto
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Presupuesto estimado</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                <input
                  type="number"
                  value={presupuesto}
                  onChange={(e) => setPresupuesto(e.target.value)}
                  placeholder="15000"
                  className="w-full bg-surface-700 border border-surface-600 rounded-lg pl-7 pr-3 py-2.5 text-sm placeholder-gray-500"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Fecha estimada de entrega
              </label>
              <input
                type="date"
                value={fechaEntrega}
                onChange={(e) => setFechaEntrega(e.target.value)}
                className="w-full bg-surface-700 border border-surface-600 rounded-lg px-3 py-2.5 text-sm text-gray-300"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end pb-8">
          <Link
            href={`/ordenes/${id}`}
            className="px-5 py-2.5 rounded-lg text-sm font-medium bg-surface-700 text-gray-300 hover:bg-surface-600 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading || !dispositivo || !problema}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-brand-teal hover:bg-brand-teal-dark text-surface-900 transition-colors disabled:opacity-50"
          >
            {loading ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}
