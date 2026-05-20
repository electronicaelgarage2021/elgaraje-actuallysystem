"use client";

import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import Link from "next/link";
import { EditClientButton, DeleteClientButton } from "./clients-actions";
import type { Cliente } from "@/lib/types";

const AVATAR_COLORS = [
  "bg-brand-teal/15 text-brand-teal",
  "bg-purple-500/15 text-purple-400",
  "bg-orange-500/15 text-orange-400",
  "bg-blue-500/15 text-blue-400",
  "bg-pink-500/15 text-pink-400",
  "bg-yellow-500/15 text-yellow-400",
];

function getInitials(nombre: string) {
  const parts = nombre.split(/[\s,]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return nombre.slice(0, 2).toUpperCase();
}

function normalize(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export function ClientsList({ clientes }: { clientes: Cliente[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return clientes;
    const qDigits = q.replace(/\D/g, "");
    return clientes.filter((c) => {
      if (normalize(c.nombre).includes(q)) return true;
      if (qDigits) {
        const tel = (c.telefono || "").replace(/\D/g, "");
        const dni = (c.dni || "").replace(/\D/g, "");
        if (tel.includes(qDigits) || dni.includes(qDigits)) return true;
      }
      return false;
    });
  }, [clientes, query]);

  return (
    <div>
      {/* Search */}
      <div className="relative mb-4">
        <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar por nombre, telefono o DNI..."
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

      {/* Count */}
      <p className="text-gray-400 text-sm mb-3">
        {filtered.length} cliente{filtered.length !== 1 ? "s" : ""}
        {query ? ` encontrado${filtered.length !== 1 ? "s" : ""}` : ` registrado${filtered.length !== 1 ? "s" : ""}`}
      </p>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-surface-800 border border-surface-600 rounded-xl p-12 text-center">
          <p className="text-gray-500">
            {query ? `No se encontraron clientes para "${query}"` : "No hay clientes registrados"}
          </p>
        </div>
      ) : (
        <div className="bg-surface-800 border border-surface-600 rounded-xl overflow-hidden">
          <div className="divide-y divide-surface-700">
            {filtered.map((cliente, index) => (
              <div
                key={cliente.id}
                className="px-5 py-4 card-hover flex items-center justify-between"
              >
                <Link
                  href={`/clientes/${cliente.id}`}
                  className="flex items-center gap-4 flex-1 cursor-pointer"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${AVATAR_COLORS[index % AVATAR_COLORS.length]}`}>
                    {getInitials(cliente.nombre)}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{cliente.nombre}</div>
                    <div className="text-xs text-gray-500">
                      {cliente.dni ? `DNI: ${cliente.dni}` : ""}
                      {cliente.dni && cliente.telefono ? " · " : ""}
                      {cliente.telefono || ""}
                    </div>
                  </div>
                </Link>
                <div className="flex items-center gap-1">
                  <EditClientButton client={cliente} />
                  <DeleteClientButton clientId={cliente.id} clientName={cliente.nombre} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
