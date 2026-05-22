"use client";

import { useState, useMemo } from "react";
import { ESTADOS } from "@/lib/constants";
import { Search, X } from "lucide-react";
import { EstadoBadge } from "@/components/estado-badge";
import { DashboardEntregarBtn } from "@/components/dashboard-entregar-btn";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { Eye } from "lucide-react";
import type { EstadoOrden } from "@/lib/types";

interface Orden {
  id: string;
  numero: number;
  dispositivo: string;
  problema: string;
  estado: EstadoOrden;
  presupuesto: number | null;
  fecha_ingreso: string;
  cliente: { nombre: string; dni: string | null; telefono: string | null } | null;
}

function normalize(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export function OrdersFilter({ ordenes }: { ordenes: Orden[] }) {
  const [query, setQuery] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<string>("");

  const filtered = useMemo(() => {
    let result = ordenes;

    if (estadoFilter) {
      result = result.filter((o) => o.estado === estadoFilter);
    }

    const q = normalize(query.trim());
    if (q) {
      const qDigits = q.replace(/\D/g, "");
      result = result.filter((o) => {
        if (normalize(o.dispositivo).includes(q)) return true;
        if (normalize(o.problema).includes(q)) return true;
        if (o.cliente && normalize(o.cliente.nombre).includes(q)) return true;
        if (qDigits) {
          if (String(o.numero).includes(qDigits)) return true;
          if (o.cliente?.dni && o.cliente.dni.replace(/\D/g, "").includes(qDigits)) return true;
          if (o.cliente?.telefono && o.cliente.telefono.replace(/\D/g, "").includes(qDigits)) return true;
        }
        return false;
      });
    }

    return result;
  }, [ordenes, query, estadoFilter]);

  return (
    <>
      {/* Search */}
      <div className="relative mb-4">
        <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar por nombre, equipo, problema, Nro o DNI..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-surface-700 border border-surface-600 rounded-lg pl-10 pr-10 py-2.5 text-sm placeholder-gray-500"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Estado chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setEstadoFilter("")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            !estadoFilter
              ? "bg-brand-teal/15 text-brand-teal border border-brand-teal/30"
              : "bg-surface-700 text-gray-400 hover:bg-surface-600"
          }`}
        >
          Todos
        </button>
        {ESTADOS.map((estado) => (
          <button
            key={estado.value}
            onClick={() => setEstadoFilter(estadoFilter === estado.value ? "" : estado.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              estadoFilter === estado.value
                ? "bg-brand-teal/15 text-brand-teal border border-brand-teal/30"
                : "bg-surface-700 text-gray-400 hover:bg-surface-600"
            }`}
          >
            {estado.label}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="text-gray-400 text-sm mb-3">
        {filtered.length} orden{filtered.length !== 1 ? "es" : ""}
        {query || estadoFilter ? " encontrada" + (filtered.length !== 1 ? "s" : "") : ""}
      </p>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-surface-800 border border-surface-600 rounded-xl p-12 text-center">
          <p className="text-gray-500">
            {query ? `No se encontraron ordenes para "${query}"` : "No hay ordenes"}
          </p>
        </div>
      ) : (
        <div className="bg-surface-800 border border-surface-600 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-600 text-gray-400 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 text-left font-medium">#</th>
                  <th className="px-4 py-3 text-left font-medium">Cliente</th>
                  <th className="px-4 py-3 text-left font-medium">Equipo</th>
                  <th className="px-4 py-3 text-left font-medium">Problema</th>
                  <th className="px-4 py-3 text-left font-medium">Estado</th>
                  <th className="px-4 py-3 text-left font-medium">Presupuesto</th>
                  <th className="px-4 py-3 text-left font-medium">Ingreso</th>
                  <th className="px-4 py-3 text-center font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-700">
                {filtered.map((orden) => (
                  <tr key={orden.id} className="card-hover cursor-pointer">
                    <td className="px-4 py-3 font-mono text-gray-500">{orden.numero}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{orden.cliente?.nombre}</div>
                      {orden.cliente?.dni && (
                        <div className="text-xs text-gray-500">DNI: {orden.cliente.dni}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">{orden.dispositivo}</td>
                    <td className="px-4 py-3 text-gray-300 max-w-48 truncate">{orden.problema}</td>
                    <td className="px-4 py-3"><EstadoBadge estado={orden.estado} /></td>
                    <td className="px-4 py-3">
                      {orden.presupuesto ? (
                        <span className="font-medium">${orden.presupuesto.toLocaleString("es-AR")}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {format(new Date(orden.fecha_ingreso), "dd/MM", { locale: es })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Link href={`/ordenes/${orden.id}`} className="text-gray-500 hover:text-brand-teal p-1">
                          <Eye className="w-4 h-4" />
                        </Link>
                        {orden.estado === "finalizado" && (
                          <DashboardEntregarBtn ordenId={orden.id} />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
