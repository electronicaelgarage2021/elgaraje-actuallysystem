"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ESTADOS } from "@/lib/constants";
import { Search, X } from "lucide-react";

interface OrdersFilterProps {
  currentEstado?: string;
  currentQuery?: string;
}

export function OrdersFilter({
  currentEstado,
  currentQuery,
}: OrdersFilterProps) {
  const router = useRouter();
  const [query, setQuery] = useState(currentQuery || "");

  function updateFilter(estado?: string, q?: string) {
    const params = new URLSearchParams();
    if (estado) params.set("estado", estado);
    if (q) params.set("q", q);
    router.push(`/ordenes?${params.toString()}`);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    updateFilter(currentEstado, query);
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="relative flex-1">
        <svg
          className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Buscar por nombre, DNI, Nº orden o modelo..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-surface-700 border border-surface-600 rounded-lg pl-10 pr-10 py-2.5 text-sm placeholder-gray-500"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              updateFilter(currentEstado, undefined);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </form>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => updateFilter(undefined, query || undefined)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            !currentEstado
              ? "bg-brand-teal/15 text-brand-teal border border-brand-teal/30"
              : "bg-surface-700 text-gray-400 hover:bg-surface-600"
          }`}
        >
          Todos
        </button>
        {ESTADOS.map((estado) => (
          <button
            key={estado.value}
            onClick={() =>
              updateFilter(
                currentEstado === estado.value ? undefined : estado.value,
                query || undefined
              )
            }
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              currentEstado === estado.value
                ? "bg-brand-teal/15 text-brand-teal border border-brand-teal/30"
                : "bg-surface-700 text-gray-400 hover:bg-surface-600"
            }`}
          >
            {estado.label}
          </button>
        ))}
      </div>
    </div>
  );
}
