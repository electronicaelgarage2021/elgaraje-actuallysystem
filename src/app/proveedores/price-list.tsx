"use client";

import { useState } from "react";
import { Search, ExternalLink, RefreshCw } from "lucide-react";

interface PriceListProps {
  data: string[][];
}

export function PriceList({ data }: PriceListProps) {
  const [query, setQuery] = useState("");

  if (data.length === 0) {
    return (
      <div className="mt-6 bg-surface-800 border border-surface-600 rounded-xl p-8 text-center text-gray-500 text-sm">
        No se pudo cargar la lista de precios
      </div>
    );
  }

  // First rows are headers, find the header row (the one with "PRECIO" in it)
  let headerIdx = 0;
  for (let i = 0; i < Math.min(data.length, 10); i++) {
    if (data[i].some((c) => c.toUpperCase().includes("PRECIO"))) {
      headerIdx = i;
      break;
    }
  }

  const headers = data[headerIdx];
  const rows = data.slice(headerIdx + 1);

  // Filter rows by search query
  const filtered = query.trim()
    ? rows.filter((row) =>
        row.some((cell) => cell.toLowerCase().includes(query.toLowerCase()))
      )
    : rows;

  return (
    <div className="mt-6 bg-surface-800 border border-surface-600 rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-surface-600 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold shrink-0">Lista de Precios — BYTE CBA</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar repuesto..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-surface-700 border border-surface-600 rounded-lg pl-8 pr-3 py-1.5 text-xs text-gray-300 placeholder-gray-500 w-48 md:w-64"
            />
          </div>
          <a
            href="https://docs.google.com/spreadsheets/d/1lSdnSLsJHQ4bjLFC2GtaI_G85fjogyti9JzL0QT_0qc/edit?gid=222576120#gid=222576120"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg text-gray-500 hover:text-brand-teal hover:bg-brand-teal/10 transition-colors"
            title="Abrir en Google Sheets"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      <div className="overflow-x-auto" style={{ maxHeight: "500px", overflowY: "auto" }}>
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-surface-800 z-10">
            <tr className="border-b border-surface-600 text-gray-400 text-xs uppercase tracking-wider">
              {headers.map((h, i) => (
                <th key={i} className="px-4 py-2.5 text-left font-medium whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-700">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={headers.length} className="px-4 py-8 text-center text-gray-500 text-sm">
                  No se encontraron resultados para &quot;{query}&quot;
                </td>
              </tr>
            ) : (
              filtered.map((row, ri) => (
                <tr key={ri} className="card-hover">
                  {headers.map((_, ci) => (
                    <td key={ci} className="px-4 py-2 whitespace-nowrap">
                      {row[ci] || ""}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="px-5 py-2 border-t border-surface-600 text-[0.65rem] text-gray-600 flex items-center gap-1.5">
        <RefreshCw className="w-3 h-3" />
        Se actualiza cada 5 minutos desde Google Sheets · {filtered.length} de {rows.length} productos
      </div>
    </div>
  );
}
